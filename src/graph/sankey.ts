/*
    Rendering sparql-results+json object into a sanky graph
  
    References:
      https://github.com/d3/d3-plugins/tree/master/sankey
      http://bost.ocks.org/mike/sankey/
  
    Options:
      config = {
        "width":    1000,      // canvas width (optional)
        "height":   900,       // canvas height (optional)
        "margin":   50,        // canvas margin (optional)
        "selector": "#result"
        // options for d3sparql.graph() can be added here ...
      }
  
    Synopsis:
      d3sparql.query(endpoint, sparql, render)
  
      function render(json) {
        var config = { ... }
        d3sparql.sankey(json, config)
      }
  
    CSS/SVG:
      <style>
      .node rect {
        cursor: move;
        fill-opacity: .9;
        shape-rendering: crispEdges;
      }
      .node text {
        pointer-events: none;
        text-shadow: 0 1px 0 #ffffff;
      }
      .link {
        fill: none;
        stroke: #000000;
        stroke-opacity: .2;
      }
      .link:hover {
        stroke-opacity: .5;
      }
      </style>
  
    Dependencies:
      * sankey.js
        * Download from https://github.com/d3/d3-plugins/tree/master/sankey
        * Put <script src="sankey.js"></script> in the HTML <head> section
  */
d3sparql.sankey = function (json, config) {
  config = config || {}

  const graph = json.head && json.results ? d3sparql.graph(json, config) : json

  const opts = {
    width: config.width || 750,
    height: config.height || 1200,
    margin: config.margin || 10,
    selector: config.selector || null
  }

  const nodes = graph.nodes
  const links = graph.links
  for (let i = 0; i < links.length; i++) {
    links[i].value = 2 // TODO: fix to use values on links
  }
  const sankey = d3
    .sankey()
    .size([opts.width, opts.height])
    .nodeWidth(15)
    .nodePadding(10)
    .nodes(nodes)
    .links(links)
    .layout(32)
  const path = sankey.link()
  const color = d3.scale.category20()
  const svg = d3sparql
    .select(opts.selector, "sankey")
    .append("svg")
    .attr("width", opts.width + opts.margin * 2)
    .attr("height", opts.height + opts.margin * 2)
    .append("g")
    .attr("transform", "translate(" + opts.margin + "," + opts.margin + ")")
  const link = svg
    .selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", path)
    .attr("stroke-width", function (d) {
      return Math.max(1, d.dy)
    })
    .sort(function (a, b) {
      return b.dy - a.dy
    })
  const node = svg
    .selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")"
    })
    .call(
      d3.behavior
        .drag()
        .origin(function (d) {
          return d
        })
        .on("dragstart", function () {
          this.parentNode.appendChild(this)
        })
        .on("drag", dragmove)
    )
  node
    .append("rect")
    .attr("width", function (d) {
      return d.dx
    })
    .attr("height", function (d) {
      return d.dy
    })
    .attr("fill", function (d) {
      return color(d.label)
    })
    .attr("opacity", 0.5)
  node
    .append("text")
    .attr("x", -6)
    .attr("y", function (d) {
      return d.dy / 2
    })
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .text(function (d) {
      return d.label
    })
    .filter(function (d) {
      return d.x < opts.width / 2
    })
    .attr("x", 6 + sankey.nodeWidth())
    .attr("text-anchor", "start")

  // default CSS/SVG
  link.attr({
    fill: "none",
    stroke: "grey",
    opacity: 0.5
  })

  function dragmove(d) {
    d3.select(this).attr(
      "transform",
      "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(opts.height - d.dy, d3.event.y))) + ")"
    )
    sankey.relayout()
    link.attr("d", path)
  }
}
