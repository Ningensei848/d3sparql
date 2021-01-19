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
d3sparql.tree = function (json, config) {
  config = config || {}

  const head = json.head.vars
  const data = json.results.bindings

  const opts = {
    root: config.root || head[0],
    parent: config.parent || head[1],
    child: config.child || head[2],
    value: config.value || head[3] || "value"
  }

  const pair = d3.map()
  const size = d3.map()
  const root = data[0][opts.root].value
  let parent = (child = children = true)
  for (let i = 0; i < data.length; i++) {
    parent = data[i][opts.parent].value
    child = data[i][opts.child].value
    if (parent != child) {
      if (pair.has(parent)) {
        children = pair.get(parent)
        children.push(child)
      } else {
        children = [child]
      }
      pair.set(parent, children)
      if (data[i][opts.value]) {
        size.set(child, data[i][opts.value].value)
      }
    }
  }
  function traverse(node) {
    const list = pair.get(node)
    if (list) {
      const children = list.map(function (d) {
        return traverse(d)
      })
      // sum of values of children
      const subtotal = d3.sum(children, function (d) {
        return d.value
      })
      // add a value of parent if exists
      const total = d3.sum([subtotal, size.get(node)])
      return { name: node, children: children, value: total }
    } else {
      return { name: node, value: size.get(node) || 1 }
    }
  }
  const tree = traverse(root)

  if (d3sparql.debug) {
    console.log(JSON.stringify(tree))
  }
  return tree
}
