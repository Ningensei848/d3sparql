/*
    Rendering sparql-results+json object into a bar chart
  
    References:
      http://bl.ocks.org/mbostock/3885304
      http://bl.ocks.org/mbostock/4403522
  
    Options:
      config = {
        "label_x":  "Prefecture",  // label for x-axis (optional; default is same as var_x)
        "label_y":  "Area",        // label for y-axis (optional; default is same as var_y)
        "var_x":    "pref",        // SPARQL variable name for x-axis (optional; default is the 1st variable)
        "var_y":    "area",        // SPARQL variable name for y-axis (optional; default is the 2nd variable)
        "width":    850,           // canvas width (optional)
        "height":   300,           // canvas height (optional)
        "margin":   40,            // canvas margin (optional)
        "selector": "#result"
      }
  
    Synopsis:
      d3sparql.query(endpoint, sparql, render)
  
      function render(json) {
        var config = { ... }
        d3sparql.barchart(json, config)
      }
  
    CSS/SVG:
      <style>
      .bar {
        fill: steelblue;
      }
      .bar:hover {
        fill: brown;
      }
      .axis {
        font: 10px sans-serif;
      }
      .axis path,
      .axis line {
        fill: none;
        stroke: #000000;
        shape-rendering: crispEdges;
      }
      .x.axis path {
        display: none;
      }
      </style>
  */
d3sparql.barchart = function (json, config) {
  config = config || {}

  const head = json.head.vars
  const data = json.results.bindings

  const opts = {
    label_x: config.label_x || head[0],
    label_y: config.label_y || head[1],
    var_x: config.var_x || head[0],
    var_y: config.var_y || head[1],
    width: config.width || 750,
    height: config.height || 300,
    margin: config.margin || 80, // TODO: to make use of {top: 10, right: 10, bottom: 80, left: 80}
    selector: config.selector || null
  }

  const scale_x = d3.scale.ordinal().rangeRoundBands([0, opts.width - opts.margin], 0.1)
  const scale_y = d3.scale.linear().range([opts.height - opts.margin, 0])
  const axis_x = d3.svg.axis().scale(scale_x).orient("bottom")
  const axis_y = d3.svg.axis().scale(scale_y).orient("left") // .ticks(10, "%")
  scale_x.domain(
    data.map(function (d) {
      return d[opts.var_x].value
    })
  )
  scale_y.domain(
    d3.extent(data, function (d) {
      return parseInt(d[opts.var_y].value)
    })
  )

  const svg = d3sparql
    .select(opts.selector, "barchart")
    .append("svg")
    .attr("width", opts.width)
    .attr("height", opts.height)
  //    .append("g")
  //    .attr("transform", "translate(" + opts.margin + "," + 0 + ")")

  const ax = svg
    .append("g")
    .attr("class", "axis x")
    .attr("transform", "translate(" + opts.margin + "," + (opts.height - opts.margin) + ")")
    .call(axis_x)
  const ay = svg
    .append("g")
    .attr("class", "axis y")
    .attr("transform", "translate(" + opts.margin + ",0)")
    .call(axis_y)
  const bar = svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("transform", "translate(" + opts.margin + "," + 0 + ")")
    .attr("class", "bar")
    .attr("x", function (d) {
      return scale_x(d[opts.var_x].value)
    })
    .attr("width", scale_x.rangeBand())
    .attr("y", function (d) {
      return scale_y(d[opts.var_y].value)
    })
    .attr("height", function (d) {
      return opts.height - scale_y(parseInt(d[opts.var_y].value)) - opts.margin
    })
  /*
        .call(function(e) {
          e.each(function(d) {
            console.log(parseInt(d[opts.var_y].value))
          })
        })
    */
  ax.selectAll("text")
    .attr("dy", ".35em")
    .attr("x", 10)
    .attr("y", 0)
    .attr("transform", "rotate(90)")
    .style("text-anchor", "start")
  ax.append("text")
    .attr("class", "label")
    .text(opts.label_x)
    .style("text-anchor", "middle")
    .attr("transform", "translate(" + (opts.width - opts.margin) / 2 + "," + (opts.margin - 5) + ")")
  ay.append("text")
    .attr("class", "label")
    .text(opts.label_y)
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - opts.height / 2)
    .attr("y", 0 - (opts.margin - 20))

  // default CSS/SVG
  bar.attr({
    fill: "steelblue"
  })
  svg.selectAll(".axis").attr({
    stroke: "black",
    fill: "none",
    "shape-rendering": "crispEdges"
  })
  svg.selectAll("text").attr({
    stroke: "none",
    fill: "black",
    "font-size": "8pt",
    "font-family": "sans-serif"
  })
}
