/*
    Rendering sparql-results+json object into a treemap
  
    References:
      http://bl.ocks.org/4063582  Treemap
  
    Options:
      config = {
        "width":    800,       // canvas width (optional)
        "height":   500,       // canvas height (optional)
        "margin":   {"top": 10, "right": 10, "bottom": 10, "left": 10},
        "selector": "#result"
        // options for d3sparql.tree() can be added here ...
      }
  
    Synopsis:
      d3sparql.query(endpoint, sparql, render)
  
      function render(json) {
        var config = { ... }
        d3sparql.treemap(json, config)
      }
  
    CSS/SVG:
      <style>
      .node {
        border: solid 1px white;
        font: 10px sans-serif;
        line-height: 12px;
        overflow: hidden;
        position: absolute;
        text-indent: 2px;
      }
      </style>
  */
d3sparql.treemap = function (json, config) {
  config = config || {}

  const tree = json.head && json.results ? d3sparql.tree(json, config) : json

  const opts = {
    width: config.width || 800,
    height: config.height || 500,
    count: config.count || false,
    color: config.color || d3.scale.category20c(),
    margin: config.margin || { top: 0, right: 0, bottom: 0, left: 0 },
    selector: config.selector || null
  }

  const width = opts.width - opts.margin.left - opts.margin.right
  const height = opts.height - opts.margin.top - opts.margin.bottom
  const color = opts.color

  function count(d) {
    return 1
  }
  function size(d) {
    return d.value
  }

  const treemap = d3.layout
    .treemap()
    .size([width, height])
    .sticky(true)
    .value(opts.count ? count : size)

  const div = d3sparql
    .select(opts.selector, "treemap")
    .style("position", "relative")
    .style("width", opts.width + "px")
    .style("height", opts.height + "px")
    .style("left", opts.margin.left + "px")
    .style("top", opts.margin.top + "px")

  const node = div
    .datum(tree)
    .selectAll(".node")
    .data(treemap.nodes)
    .enter()
    .append("div")
    .attr("class", "node")
    .call(position)
    .style("background", function (d) {
      return d.children ? color(d.name) : null
    })
    .text(function (d) {
      return d.children ? null : d.name
    })

  // default CSS/SVG
  node.style({
    "border-style": "solid",
    "border-width": "1px",
    "border-color": "white",
    "font-size": "10px",
    "font-family": "sans-serif",
    "line-height": "12px",
    overflow: "hidden",
    position: "absolute",
    "text-indent": "2px"
  })

  function position() {
    this.style("left", function (d) {
      return d.x + "px"
    })
      .style("top", function (d) {
        return d.y + "px"
      })
      .style("width", function (d) {
        return Math.max(0, d.dx - 1) + "px"
      })
      .style("height", function (d) {
        return Math.max(0, d.dy - 1) + "px"
      })
  }
}
