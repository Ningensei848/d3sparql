/*
    Rendering sparql-results+json object into a force graph
  
    References:
      http://bl.ocks.org/mbostock/4062045
  
    Options:
      config = {
        "radius":   12,        // static value or a function to calculate radius of nodes (optional)
        "charge":   -250,      // force between nodes (optional; negative: repulsion, positive: attraction)
        "distance": 30,        // target distance between linked nodes (optional)
        "width":    1000,      // canvas width (optional)
        "height":   500,       // canvas height (optional)
        "label":    "name",    // SPARQL variable name for node labels (optional)
        "selector": "#result"
        // options for d3sparql.graph() can be added here ...
      }
  
    Synopsis:
      d3sparql.query(endpoint, sparql, render)
  
      function render(json) {
        var config = { ... }
        d3sparql.forcegraph(json, config)
      }
  
    CSS/SVG:
      <style>
      .link {
        stroke: #999999;
      }
      .node {
        stroke: black;
        opacity: 0.5;
      }
      circle.node {
        stroke-width: 1px;
        fill: lightblue;
      }
      text.node {
        font-family: "sans-serif";
        font-size: 8px;
      }
      </style>
  
    TODO:
      Try other d3.layout.force options.
  */

import * as d3 from "d3"

import graph from "../util/graph"
import select from "../util/select"

const forcegraph = (json, config) => {
  // configがfalseオブジェクトなら `{}` になる？
  config = config || {}
  // 三項演算子による分岐: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Conditional_Operator
  const graph = json.head && json.results ? graph(json, config) : json
  const scale = d3
    .scaleLinear()
    .domain(
      // An optional accessor function may be specified, which is equivalent to calling Array.from before computing the extent.
      d3.extent(graph.nodes, (d) => {
        return parseFloat(d.value)
      })
    )
    .range([1, 20])

  const opts = {
    radius:
      config.radius ||
      function (d) {
        return d.value ? scale(d.value) : 1 + d.label.length
      },
    charge: config.charge || -500,
    distance: config.distance || 50,
    width: config.width || 1000,
    height: config.height || 750,
    label: config.label || false,
    selector: config.selector || null
  }
  const svg = select(opts.selector, "forcegraph").append("svg").attr("width", opts.width).attr("height", opts.height)
  const link = svg.selectAll(".link").data(graph.links).enter().append("line").attr("class", "link")
  const node = svg.selectAll(".node").data(graph.nodes).enter().append("g")
  const circle = node.append("circle").attr("class", "node").attr("r", opts.radius)
  const text = node
    .append("text")
    .text((d) => {
      return d[opts.label || "label"]
    })
    .attr("class", "node")
  const force = d3.layout
    .force()
    .charge(opts.charge)
    .linkDistance(opts.distance)
    .size([opts.width, opts.height])
    .nodes(graph.nodes)
    .links(graph.links)
    .start()
  force.on("tick", function () {
    link
      .attr("x1", (d) => {
        return d.source.x
      })
      .attr("y1", (d) => {
        return d.source.y
      })
      .attr("x2", (d) => {
        return d.target.x
      })
      .attr("y2", (d) => {
        return d.target.y
      })
    text
      .attr("x", (d) => {
        return d.x
      })
      .attr("y", (d) => {
        return d.y
      })
    circle
      .attr("cx", (d) => {
        return d.x
      })
      .attr("cy", (d) => {
        return d.y
      })
  })
  node.call(force.drag)

  // default CSS/SVG
  link.attr({
    stroke: "#999999"
  })
  circle.attr({
    stroke: "black",
    "stroke-width": "1px",
    fill: "lightblue",
    opacity: 1
  })
  text.attr({
    "font-size": "8px",
    "font-family": "sans-serif"
  })
}

export default forcegraph

// d3sparql.forcegraph = function (json, config) {
//   config = config || {}

//   const graph = json.head && json.results ? d3sparql.graph(json, config) : json

//   const scale = d3.scale
//     .linear()
//     .domain(
//       d3.extent(graph.nodes, (d) => {
//         return parseFloat(d.value)
//       })
//     )
//     .range([1, 20])

//   const opts = {
//     radius:
//       config.radius ||
//       (d) => {
//         return d.value ? scale(d.value) : 1 + d.label.length
//       },
//     charge: config.charge || -500,
//     distance: config.distance || 50,
//     width: config.width || 1000,
//     height: config.height || 750,
//     label: config.label || false,
//     selector: config.selector || null
//   }

//   const svg = d3sparql
//     .select(opts.selector, 'forcegraph')
//     .append('svg')
//     .attr('width', opts.width)
//     .attr('height', opts.height)
//   const link = svg.selectAll('.link').data(graph.links).enter().append('line').attr('class', 'link')
//   const node = svg.selectAll('.node').data(graph.nodes).enter().append('g')
//   const circle = node.append('circle').attr('class', 'node').attr('r', opts.radius)
//   const text = node
//     .append('text')
//     .text((d) => {
//       return d[opts.label || 'label']
//     })
//     .attr('class', 'node')
//   const force = d3.layout
//     .force()
//     .charge(opts.charge)
//     .linkDistance(opts.distance)
//     .size([opts.width, opts.height])
//     .nodes(graph.nodes)
//     .links(graph.links)
//     .start()
//   force.on('tick', function () {
//     link
//       .attr('x1', (d) => {
//         return d.source.x
//       })
//       .attr('y1', (d) => {
//         return d.source.y
//       })
//       .attr('x2', (d) => {
//         return d.target.x
//       })
//       .attr('y2', (d) => {
//         return d.target.y
//       })
//     text
//       .attr('x', (d) => {
//         return d.x
//       })
//       .attr('y', (d) => {
//         return d.y
//       })
//     circle
//       .attr('cx', (d) => {
//         return d.x
//       })
//       .attr('cy', (d) => {
//         return d.y
//       })
//   })
//   node.call(force.drag)

//   // default CSS/SVG
//   link.attr({
//     stroke: '#999999'
//   })
//   circle.attr({
//     stroke: 'black',
//     'stroke-width': '1px',
//     fill: 'lightblue',
//     opacity: 1
//   })
//   text.attr({
//     'font-size': '8px',
//     'font-family': 'sans-serif'
//   })
// }
