/*
    Rendering sparql-results+json object into a circle pack
  
    References:
      http://mbostock.github.com/d3/talk/20111116/pack-hierarchy.html  Circle Packing
  
    Options:
      config = {
        "width":    800,       // canvas width (optional)
        "height":   800,       // canvas height (optional)
        "diameter": 700,       // diamieter of the outer circle (optional)
        "selector": "#result"
        // options for d3sparql.tree() can be added here ...
      }
  
    Synopsis:
      d3sparql.query(endpoint, sparql, render)
  
      function render(json) {
        var config = { ... }
        d3sparql.circlepack(json, config)
      }
  
    CSS/SVG:
      <style>
      text {
        font-size: 11px;
        pointer-events: none;
      }
      text.parent {
        fill: #1f77b4;
      }
      circle {
        fill: #cccccc;
        stroke: #999999;
        pointer-events: all;
      }
      circle.parent {
        fill: #1f77b4;
        fill-opacity: .1;
        stroke: steelblue;
      }
      circle.parent:hover {
        stroke: #ff7f0e;
        stroke-width: .5px;
      }
      circle.child {
        pointer-events: none;
      }
      </style>
  
    TODO:
      Fix rotation angle for each text to avoid string collision
  */
d3sparql.circlepack = function (json, config) {
  config = config || {}

  const tree = json.head && json.results ? d3sparql.tree(json, config) : json

  const opts = {
    width: config.width || 800,
    height: config.height || 800,
    diameter: config.diameter || 700,
    selector: config.selector || null
  }

  const w = opts.width,
    h = opts.height,
    r = opts.diameter,
    x = d3.scale.linear().range([0, r]),
    y = d3.scale.linear().range([0, r])

  const pack = d3.layout
    .pack()
    .size([r, r])
    .value(function (d) {
      return d.value
    })

  const node = tree
  const nodes = pack.nodes(tree)

  const vis = d3sparql
    .select(opts.selector, "circlepack")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .append("g")
    .attr("transform", "translate(" + (w - r) / 2 + "," + (h - r) / 2 + ")")

  vis
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("class", function (d) {
      return d.children ? "parent" : "child"
    })
    .attr("cx", function (d) {
      return d.x
    })
    .attr("cy", function (d) {
      return d.y
    })
    .attr("r", function (d) {
      return d.r
    })
    /*
        // CSS: circle { ... }
        .attr("fill", function(d) { return d.children ? "#1f77b4" : "#cccccc" })
        .attr("fill-opacity", function(d) { return d.children ? ".1" : "1" })
        .attr("stroke", function(d) { return d.children ? "steelblue" : "#999999" })
        .attr("pointer-events", function(d) { return d.children ? "all" : "none" })
        .on("mouseover", function() { d3.select(this).attr("stroke", "#ff7f0e").attr("stroke-width", ".5px") })
        .on("mouseout", function() { d3.select(this).attr("stroke", "steelblue").attr("stroke-width", ".5px") })
    */
    .on("click", function (d) {
      return zoom(node === d ? tree : d)
    })

  vis
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .attr("class", function (d) {
      return d.children ? "parent" : "child"
    })
    .attr("x", function (d) {
      return d.x
    })
    .attr("y", function (d) {
      return d.y
    })
    //    .attr("dy", ".35em")
    .style("opacity", function (d) {
      return d.r > 20 ? 1 : 0
    })
    .text(function (d) {
      return d.name
    })
    // rotate to avoid string collision
    //.attr("text-anchor", "middle")
    .attr("text-anchor", "start")
    .transition()
    .duration(1000)
    .attr("transform", function (d) {
      return "rotate(-30, " + d.x + ", " + d.y + ")"
    })

  d3.select(window).on("click", function () {
    zoom(tree)
  })

  function zoom(d, i) {
    const k = r / d.r / 2
    x.domain([d.x - d.r, d.x + d.r])
    y.domain([d.y - d.r, d.y + d.r])
    const t = vis.transition().duration(d3.event.altKey ? 2000 : 500)
    t.selectAll("circle")
      .attr("cx", function (d) {
        return x(d.x)
      })
      .attr("cy", function (d) {
        return y(d.y)
      })
      .attr("r", function (d) {
        return k * d.r
      })
    t.selectAll("text")
      .attr("x", function (d) {
        return x(d.x)
      })
      .attr("y", function (d) {
        return y(d.y)
      })
      .style("opacity", function (d) {
        return k * d.r > 20 ? 1 : 0
      })
    d3.event.stopPropagation()
  }
}
