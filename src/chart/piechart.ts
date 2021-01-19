/*
    Rendering sparql-results+json object into a pie chart
  
    References:
      http://bl.ocks.org/mbostock/3887235 Pie chart
      http://bl.ocks.org/mbostock/3887193 Donut chart
  
    Options:
      config = {
        "label":    "pref",    // SPARQL variable name for slice label (optional; default is the 1st variable)
        "size":     "area",    // SPARQL variable name for slice value (optional; default is the 2nd variable)
        "width":    700,       // canvas width (optional)
        "height":   600,       // canvas height (optional)
        "margin":   10,        // canvas margin (optional)
        "hole":     50,        // radius size of a center hole (optional; 0 for pie, r > 0 for doughnut)
        "selector": "#result"
      }
  
    Synopsis:
      d3sparql.query(endpoint, sparql, render)
  
      function render(json) {
        var config = { ... }
        d3sparql.piechart(json, config)
      }
  
    CSS/SVG:
      <style>
      .label {
        font: 10px sans-serif;
      }
      .arc path {
        stroke: #ffffff;
      }
      </style>
  */
d3sparql.piechart = function (json, config) {
  config = config || {}

  const head = json.head.vars
  const data = json.results.bindings

  const opts = {
    label: config.label || head[0],
    size: config.size || head[1],
    width: config.width || 700,
    height: config.height || 700,
    margin: config.margin || 10,
    hole: config.hole || 100,
    selector: config.selector || null
  }

  const radius = Math.min(opts.width, opts.height) / 2 - opts.margin
  const hole = Math.max(Math.min(radius - 50, opts.hole), 0)
  const color = d3.scale.category20()

  const arc = d3.svg.arc().outerRadius(radius).innerRadius(hole)

  const pie = d3.layout
    .pie()
    //.sort(null)
    .value(function (d) {
      return d[opts.size].value
    })

  const svg = d3sparql
    .select(opts.selector, "piechart")
    .append("svg")
    .attr("width", opts.width)
    .attr("height", opts.height)
    .append("g")
    .attr("transform", "translate(" + opts.width / 2 + "," + opts.height / 2 + ")")

  const g = svg.selectAll(".arc").data(pie(data)).enter().append("g").attr("class", "arc")
  const slice = g
    .append("path")
    .attr("d", arc)
    .attr("fill", function (d, i) {
      return color(i)
    })
  const text = g
    .append("text")
    .attr("class", "label")
    .attr("transform", function (d) {
      return "translate(" + arc.centroid(d) + ")"
    })
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(function (d) {
      return d.data[opts.label].value
    })

  // default CSS/SVG
  slice.attr({
    stroke: "#ffffff"
  })
  // TODO: not working?
  svg.selectAll("text").attr({
    stroke: "none",
    fill: "black",
    "font-size": "20px",
    "font-family": "sans-serif"
  })
}
