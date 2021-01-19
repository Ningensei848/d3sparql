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

import * as d3 from "d3"

// TODO: JSONに型情報をつける
const graph = (json, config) => {
  config = config || {}

  const head = json.head.vars
  const data = json.results.bindings

  const check = d3.map()

  const opts = {
    key1: config.key1 || head[0] || "key1",
    key2: config.key2 || head[1] || "key2",
    label1: config.label1 || head[2] || false,
    label2: config.label2 || head[3] || false,
    value1: config.value1 || head[4] || false,
    value2: config.value2 || head[5] || false
  }
  const graph = {
    nodes: [],
    links: []
  }

  let index = 0

  for (const datum of data) {
    const key1 = datum[opts.key1].value
    const key2 = datum[opts.key2].value
    const label1 = opts.label1 ? datum[opts.label1].value : key1
    const label2 = opts.label2 ? datum[opts.label2].value : key2
    const value1 = opts.value1 ? datum[opts.value1].value : false
    const value2 = opts.value2 ? datum[opts.value2].value : false
    if (!check.has(key1)) {
      graph.nodes.push({ key: key1, label: label1, value: value1 })
      check.set(key1, index)
      index++
    }
    if (!check.has(key2)) {
      graph.nodes.push({ key: key2, label: label2, value: value2 })
      check.set(key2, index)
      index++
    }
    graph.links.push({ source: check.get(key1), target: check.get(key2) })
  }

  // for (var i = 0; i < data.length; i++) {
  //   var key1 = data[i][opts.key1].value
  //   var key2 = data[i][opts.key2].value
  //   var label1 = opts.label1 ? data[i][opts.label1].value : key1
  //   var label2 = opts.label2 ? data[i][opts.label2].value : key2
  //   var value1 = opts.value1 ? data[i][opts.value1].value : false
  //   var value2 = opts.value2 ? data[i][opts.value2].value : false
  //   if (!check.has(key1)) {
  //     graph.nodes.push({ key: key1, label: label1, value: value1 })
  //     check.set(key1, index)
  //     index++
  //   }
  //   if (!check.has(key2)) {
  //     graph.nodes.push({ key: key2, label: label2, value: value2 })
  //     check.set(key2, index)
  //     index++
  //   }
  //   graph.links.push({ source: check.get(key1), target: check.get(key2) })
  // }

  if (d3sparql.debug) {
    console.log(JSON.stringify(graph))
  }
  return graph
}

export default graph

// d3sparql.graph = function (json, config) {
//   config = config || {}

//   var head = json.head.vars
//   var data = json.results.bindings

//   var opts = {
//     key1: config.key1 || head[0] || 'key1',
//     key2: config.key2 || head[1] || 'key2',
//     label1: config.label1 || head[2] || false,
//     label2: config.label2 || head[3] || false,
//     value1: config.value1 || head[4] || false,
//     value2: config.value2 || head[5] || false
//   }
//   var graph = {
//     nodes: [],
//     links: []
//   }
//   var check = d3.map()
//   var index = 0
//   for (var i = 0; i < data.length; i++) {
//     var key1 = data[i][opts.key1].value
//     var key2 = data[i][opts.key2].value
//     var label1 = opts.label1 ? data[i][opts.label1].value : key1
//     var label2 = opts.label2 ? data[i][opts.label2].value : key2
//     var value1 = opts.value1 ? data[i][opts.value1].value : false
//     var value2 = opts.value2 ? data[i][opts.value2].value : false
//     if (!check.has(key1)) {
//       graph.nodes.push({ key: key1, label: label1, value: value1 })
//       check.set(key1, index)
//       index++
//     }
//     if (!check.has(key2)) {
//       graph.nodes.push({ key: key2, label: label2, value: value2 })
//       check.set(key2, index)
//       index++
//     }
//     graph.links.push({ source: check.get(key1), target: check.get(key2) })
//   }
//   if (d3sparql.debug) {
//     console.log(JSON.stringify(graph))
//   }
//   return graph
// }
