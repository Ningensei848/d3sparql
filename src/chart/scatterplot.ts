/*
    Rendering sparql-results+json object into a scatter plot
  
    References:
      http://bl.ocks.org/mbostock/3244058
  
    Options:
      config = {
        "label_x":  "Size",    // label for x-axis (optional; default is same as var_x)
        "label_y":  "Count",   // label for y-axis (optional; default is same as var_y)
        "var_x":    "size",    // SPARQL variable name for x-axis values (optional; default is the 1st variable)
        "var_y":    "count",   // SPARQL variable name for y-axis values (optional; default is the 2nd variable)
        "var_r":    "volume",  // SPARQL variable name for radius (optional; default is the 3rd variable)
        "min_r":    1,         // minimum radius size (optional; default is 1)
        "max_r":    20,        // maximum radius size (optional; default is 20)
        "width":    850,       // canvas width (optional)
        "height":   300,       // canvas height (optional)
        "margin_x": 80,        // canvas margin x (optional)
        "margin_y": 40,        // canvas margin y (optional)
        "selector": "#result"
      }
  
    Synopsis:
      d3sparql.query(endpoint, sparql, render)
  
      function render(json) {
        var config = { ... }
        d3sparql.scatterplot(json, config)
      }
  
    CSS/SVG:
      <style>
      .label {
        font-size: 10pt;
      }
      .node circle {
        stroke: black;
        stroke-width: 1px;
        fill: pink;
        opacity: 0.5;
      }
      </style>
  */
d3sparql.scatterplot = function (json, config) {
  config = config || {}

  const head = json.head.vars
  const data = json.results.bindings

  const opts = {
    label_x: config.label_x || head[0] || "x",
    label_y: config.label_y || head[1] || "y",
    label_r: config.label_r || head[2] || "r",
    var_x: config.var_x || head[0],
    var_y: config.var_y || head[1],
    var_r: config.var_r || head[2] || 5,
    min_r: config.min_r || 1,
    max_r: config.max_r || 20,
    width: config.width || 850,
    height: config.height || 300,
    margin_x: config.margin_x || 80,
    margin_y: config.margin_y || 40,
    selector: config.selector || null
  }
  const extent_x = d3.extent(data, function (d) {
    return parseInt(d[opts.var_x].value)
  })
  const extent_y = d3.extent(data, function (d) {
    return parseInt(d[opts.var_y].value)
  })
  const extent_r = d3.extent(data, function (d) {
    return parseInt(d[opts.var_r] ? d[opts.var_r].value : opts.var_r)
  })
  const scale_x = d3.scale
    .linear()
    .range([opts.margin_x, opts.width - opts.margin_x])
    .domain(extent_x)
  const scale_y = d3.scale
    .linear()
    .range([opts.height - opts.margin_y, opts.margin_y])
    .domain(extent_y)
  const scale_r = d3.scale.linear().range([opts.min_r, opts.max_r]).domain(extent_r)
  const axis_x = d3.svg.axis().scale(scale_x)
  const axis_y = d3.svg.axis().scale(scale_y).orient("left")

  const svg = d3sparql
    .select(opts.selector, "scatterplot")
    .append("svg")
    .attr("width", opts.width)
    .attr("height", opts.height)
  const circle = svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("cx", function (d) {
      return scale_x(d[opts.var_x].value)
    })
    .attr("cy", function (d) {
      return scale_y(d[opts.var_y].value)
    })
    .attr("r", function (d) {
      return scale_r(d[opts.var_r] ? d[opts.var_r].value : opts.var_r)
    })
    .attr("opacity", 0.5)
    .append("title")
    .text(function (d) {
      return d[opts.label_r] ? d[opts.label_r].value : opts.label_r
    })
  const ax = svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (opts.height - opts.margin_y) + ")")
    .call(axis_x)
  const ay = svg
    .append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + opts.margin_x + ",0)")
    .call(axis_y)
  ax.append("text")
    .attr("class", "label")
    .text(opts.label_x)
    .style("text-anchor", "middle")
    .attr("transform", "translate(" + (opts.width - opts.margin_x) / 2 + "," + (opts.margin_y - 5) + ")")
  ay.append("text")
    .attr("class", "label")
    .text(opts.label_y)
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - opts.height / 2)
    .attr("y", 0 - (opts.margin_x - 20))

  // default CSS/SVG
  ax.attr({
    stroke: "black",
    fill: "none"
  })
  ay.attr({
    stroke: "black",
    fill: "none"
  })
  // This doesn't work with .append("circle") with .append("title") for tooltip
  circle.attr({
    stroke: "gray",
    "stroke-width": "1px",
    fill: "lightblue",
    opacity: 0.5
  })
  //svg.selectAll(".label").attr({
  svg.selectAll("text").attr({
    stroke: "none",
    fill: "black",
    "font-size": "8pt",
    "font-family": "sans-serif"
  })
}
