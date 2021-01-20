/*
    Convert sparql-results+json object into a JSON tree of {"name": name, "value": size, "children": []} format like in the flare.json file.
  
    Suitable for d3.layout.hierarchy() family
      * cluster:    d3sparql.dendrogram()
      * pack:       d3sparql.circlepack()
      * partition:  d3sparql.sunburst()
      * tree:       d3sparql.roundtree()
      * treemap:    d3sparql.treemap(), d3sparql.treemapzoom()
  
    Options:
      config = {
        "root":   "root_name",    // SPARQL variable name for root node (optional; default is the 1st variable)
        "parent": "parent_name",  // SPARQL variable name for parent node (optional; default is the 2nd variable)
        "child":  "child_name",   // SPARQL variable name for child node (ptional; default is the 3rd variable)
        "value":  "value_name"    // SPARQL variable name for numerical value of the child node (optional; default is the 4th variable or "value")
      }
  
    Synopsis:
      d3sparql.sparql(endpoint, sparql, render)
  
      function render(json) {
        var config = { ... }
        d3sparql.roundtree(json, config)
        d3sparql.dendrogram(json, config)
        d3sparql.sunburst(json, config)
        d3sparql.treemap(json, config)
        d3sparql.treemapzoom(json, config)
      }
  */

import { Failure, Result, Success } from "@/types/handling"
import { JSONResponse, BooleanMemberJSONResponse, ResultsMemberJSONResponse, RDFTerm } from "@/types/response"
import { Hogehoge, TraverseProps, Tree, treeConfig } from "@/types/tree"
import d3 from "d3"

const hogehoge = (data: Array<{ [key: string]: RDFTerm }>, opts: treeConfig): Hogehoge => {
  const pair: { [key: string]: Array<string> } = {} //d3.map()
  const size: { [key: string]: number } = {} //d3.map()

  for (const datum of data) {
    const parent = datum[opts.parent].value
    const child = datum[opts.child].value

    if (parent == child) {
      continue
    } else {
      if (parent in pair) {
        const children = pair[parent]
        children.push(child)
        pair[parent] = children
      } else {
        const children = [child]
        pair[parent] = children
      }

      const key = opts.value
      if (datum[key]) {
        size[child] = Number(datum[key].value)
        if (Number.isNaN(size[child])) {
          console.warn("Caution: size of child node is `NaN` !\n")
        }
      }
    }
    // end for-loop
  }

  return { pair: pair, size: size }
}

const traverse = (props: TraverseProps): Tree => {
  const { pair, size, nodeName } = props
  const list = pair[nodeName]

  if (!list) {
    return { name: nodeName, value: size[nodeName] || 1 }
  } else {
    const children = list.map((name) => traverse({ ...props, nodeName: name }))
    // sum of values of children
    const subTotal = d3.sum(children, (d) => d.value)
    // add a value of parent if exists
    const total = d3.sum([subTotal, size[nodeName]])
    return { name: nodeName, children: children, value: total }
  }
}

const mainProcess = (json: ResultsMemberJSONResponse, config?: treeConfig): Tree => {
  const { head, results } = json
  const data = results.bindings
  const vars = head.vars ? head.vars : []

  const opts: treeConfig = {
    root: config ? config.root : vars[0],
    parent: config ? config.parent : vars[1],
    child: config ? config.child : vars[2],
    value: config ? config.value : vars[3] || "value"
  }

  const root_bindings = data[0]
  // TODO: assert error
  const root = opts.root in root_bindings ? root_bindings[opts.root].value : "none"

  return traverse({ nodeName: root, ...hogehoge(data, opts) })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const subProcess = (json: BooleanMemberJSONResponse, config?: treeConfig): Tree => {
  const tree: Tree = {
    name: "node",
    value: 0
  }
  return tree
}

const parseTree = (json: JSONResponse, config?: treeConfig): Result<Tree, TypeError> => {
  if (json.results) {
    const tree = mainProcess({ head: json.head, results: json.results }, config)
    return new Success(tree)
  } else if (json.boolean) {
    const tree = subProcess({ head: json.head, boolean: json.boolean }, config)
    return new Success(tree)
  } else {
    return new Failure(new TypeError(`${JSON.stringify(json, null, 2)}\n\nJSON response is invalid !\n\n`))
  }
}

export const tree = (json: JSONResponse, config?: treeConfig) => {
  const res = parseTree(json, config)
  if (res.isSuccess()) {
    return res.value
  } else {
    throw res.isFailure() // TypeError
  }
}

// d3sparql.tree = function (json, config) {
//   config = config || {}

//   const head = json.head.vars
//   const data = json.results.bindings

//   const opts = {
//     root: config.root || head[0],
//     parent: config.parent || head[1],
//     child: config.child || head[2],
//     value: config.value || head[3] || "value"
//   }

//   const pair = d3.map()
//   const size = d3.map()
//   const root = data[0][opts.root].value
//   let parent = (child = children = true)
//   for (let i = 0; i < data.length; i++) {
//     parent = data[i][opts.parent].value
//     child = data[i][opts.child].value
//     if (parent != child) {
//       if (pair.has(parent)) {
//         children = pair.get(parent)
//         children.push(child)
//       } else {
//         children = [child]
//       }
//       pair.set(parent, children)
//       if (data[i][opts.value]) {
//         size.set(child, data[i][opts.value].value)
//       }
//     }
//   }

//   function traverse(node) {
//     const list = pair.get(node)
//     if (list) {
//       const children = list.map(function (d) {
//         return traverse(d)
//       })
//       // sum of values of children
//       const subtotal = d3.sum(children, function (d) {
//         return d.value
//       })
//       // add a value of parent if exists
//       const total = d3.sum([subtotal, size.get(node)])
//       return { name: node, children: children, value: total }
//     } else {
//       return { name: node, value: size.get(node) || 1 }
//     }
//   }
//   const tree = traverse(root)

//   if (d3sparql.debug) {
//     console.log(JSON.stringify(tree))
//   }
//   return tree
// }
