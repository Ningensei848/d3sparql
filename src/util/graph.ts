/*
    Convert sparql-results+json object into a JSON graph in the {"nodes": [], "links": []} form.
    Suitable for d3.layout.force(), d3.layout.sankey() etc.
  
    Options:
      config = {
        "key1":   "node1",       // SPARQL variable name for node1 (optional; default is the 1st variable)
        "key2":   "node2",       // SPARQL variable name for node2 (optional; default is the 2nd varibale)
        "label1": "node1label",  // SPARQL variable name for the label of node1 (optional; default is the 3rd variable)
        "label2": "node2label",  // SPARQL variable name for the label of node2 (optional; default is the 4th variable)
        "value1": "node1value",  // SPARQL variable name for the value of node1 (optional; default is the 5th variable)
        "value2": "node2value"   // SPARQL variable name for the value of node2 (optional; default is the 6th variable)
      }
  
    Synopsis:
      d3sparql.query(endpoint, sparql, render)
  
      function render(json) {
        var config = { ... }
        d3sparql.forcegraph(json, config)
        d3sparql.sankey(json, config)
      }
  
    TODO:
      Should follow the convention in the miserables.json https://gist.github.com/mbostock/4062045 to contain group for nodes and value for edges.
  */

// cf. https://github.com/ktym/d3sparql/blob/master/d3sparql.js#L110

import { Failure, Result, Success } from "@/types/handling"
import { BooleanMemberJSONResponse, JSONResponse, RDFTerm, ResultsMemberJSONResponse } from "@/types/response"
import { Graph, GraphConfig, Option } from "@/types/util/graph"

// interface graphConfig {
//   key1?: string
//   key2?: string
//   label1?: string
//   label2?: string
//   value1?: string
//   value2?: string
// }

// interface Node {
//   key: string
//   label: string | false
//   value: string | false
// }
// interface Edge {
//   source?: number
//   target?: number
// }

// interface Graph {
//   nodes: Array<Node>
//   edges: Array<Edge>
// }

// interface Option {
//   key1: string
//   key2: string
//   label1: string | false
//   label2: string | false
//   value1: string | false
//   value2: string | false
// }

const hogehoge = (datum: { [key: string]: RDFTerm }, opts: GraphConfig): GraphConfig => {
  const { key1, key2, label1, label2, value1, value2 } = opts
  return {
    key1: datum[key1].value,
    key2: datum[key2].value,
    label1: label1 ? datum[label1].value : key1,
    label2: label2 ? datum[label2].value : key2,
    value1: value1 ? datum[value1].value : false,
    value2: value2 ? datum[value2].value : false
  }
}

const mainProcess = (json: ResultsMemberJSONResponse, config: Option): Graph => {
  const { head, results } = json
  const data = results.bindings
  const vars = head.vars ? head.vars : []

  const opts: GraphConfig = {
    key1: config.key1 || vars[0] || "key1",
    key2: config.key2 || vars[1] || "key2",
    label1: config.label1 || vars[2] || false,
    label2: config.label2 || vars[3] || false,
    value1: config.value1 || vars[4] || false,
    value2: config.value2 || vars[5] || false
  }
  const graph: Graph = {
    nodes: [],
    edges: []
  }

  const checkDict: { [key: string]: number } = {}

  let index = 0
  for (const datum of data) {
    const { key1, key2, label1, label2, value1, value2 } = hogehoge(datum, opts)

    if (!(key1 in checkDict)) {
      graph.nodes.push({ key: key1, label: label1, value: value1 })
      checkDict[key1] = index
      index++
    }
    if (!(key2 in checkDict)) {
      graph.nodes.push({ key: key2, label: label2, value: value2 })
      checkDict[key2] = index
      index++
    }

    graph.edges.push({
      source: key1 in checkDict ? checkDict[key1] : undefined,
      target: key2 in checkDict ? checkDict[key2] : undefined
    })
  }
  return graph
}

// TODO: JSONResponse が Boolean だった時の場合の処理を追加
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const subProcess = (json: BooleanMemberJSONResponse, config: Option): Graph => {
  const graph: Graph = {
    nodes: [],
    edges: []
  }
  return graph
}

const parseGraph = (json: JSONResponse, config: Option): Result<Graph, TypeError> => {
  if (json.results) {
    const graph = mainProcess({ head: json.head, results: json.results }, config)
    return new Success(graph)
  } else if (json.boolean) {
    const graph = subProcess({ head: json.head, boolean: json.boolean }, config)
    return new Success(graph)
  } else {
    return new Failure(new TypeError(`${JSON.stringify(json, null, 2)}\n\nJSON response is invalid !\n\n`))
  }
}

export const graph = (json: JSONResponse, config: Option = {}): Graph => {
  const res = parseGraph(json, config)

  if (res.isSuccess()) {
    return res.value
  } else {
    throw res.isFailure() // TypeError
  }
}
