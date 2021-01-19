/*
    Rendering sparql-results+json object into a sunburst
  
    References:
      http://bl.ocks.org/4348373  Zoomable Sunburst
      http://www.jasondavies.com/coffee-wheel/  Coffee Flavour Wheel
  
    Options:
      config = {
        "width":    1000,      // canvas width (optional)
        "height":   900,       // canvas height (optional)
        "margin":   150,       // margin for labels (optional)
        "selector": "#result"
        // options for d3sparql.tree() can be added here ...
      }
  
    Synopsis:
      d3sparql.query(endpoint, sparql, render)
  
      function render(json) {
        var config = { ... }
        d3sparql.sunburst(json, config)
      }
  
    CSS/SVG:
      <style>
      .node text {
        font-size: 10px;
        font-family: sans-serif;
      }
      .arc {
        stroke: #ffffff;
        fill-rule: evenodd;
      }
      </style>
  */
d3sparql.sunburst = function (json, config) {
  config = config || {}

  const tree = json.head && json.results ? d3sparql.tree(json, config) : json

  const opts = {
    width: config.width || 1000,
    height: config.height || 900,
    margin: config.margin || 150,
    selector: config.selector || null
  }

  const radius = Math.min(opts.width, opts.height) / 2 - opts.margin
  const x = d3.scale.linear().range([0, 2 * Math.PI])
  const y = d3.scale.sqrt().range([0, radius])
  const color = d3.scale.category20()
  const svg = d3sparql
    .select(opts.selector, "sunburst")
    .append("svg")
    .attr("width", opts.width)
    .attr("height", opts.height)
    .append("g")
    .attr("transform", "translate(" + opts.width / 2 + "," + opts.height / 2 + ")")
  const arc = d3.svg
    .arc()
    .startAngle(function (d) {
      return Math.max(0, Math.min(2 * Math.PI, x(d.x)))
    })
    .endAngle(function (d) {
      return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)))
    })
    .innerRadius(function (d) {
      return Math.max(0, y(d.y))
    })
    .outerRadius(function (d) {
      return Math.max(0, y(d.y + d.dy))
    })
  const partition = d3.layout.partition().value(function (d) {
    return d.value
  })
  const nodes = partition.nodes(tree)
  const path = svg
    .selectAll("path")
    .data(nodes)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("class", "arc")
    .style("fill", function (d) {
      return color((d.children ? d : d.parent).name)
    })
    .on("click", click)
  const text = svg
    .selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .attr("transform", function (d) {
      const rotate = (x(d.x + d.dx / 2) * 180) / Math.PI - 90
      return "rotate(" + rotate + ") translate(" + y(d.y) + ")"
    })
    .attr("dx", ".5em")
    .attr("dy", ".35em")
    .text(function (d) {
      return d.name
    })
    .on("click", click)

  // default CSS/SVG
  path.attr({
    stroke: "#ffffff",
    "fill-rule": "evenodd"
  })
  text.attr({
    "font-size": "10px",
    "font-family": "sans-serif"
  })

  function click(d) {
    path.transition().duration(750).attrTween("d", arcTween(d))
    text
      .style("visibility", function (e) {
        // required for showing labels just before the transition when zooming back to the upper level
        return isParentOf(d, e) ? null : d3.select(this).style("visibility")
      })
      .transition()
      .duration(750)
      .attrTween("transform", function (d) {
        return function () {
          const rotate = (x(d.x + d.dx / 2) * 180) / Math.PI - 90
          return "rotate(" + rotate + ") translate(" + y(d.y) + ")"
        }
      })
      .each("end", function (e) {
        // required for hiding labels just after the transition when zooming down to the lower level
        d3.select(this).style("visibility", isParentOf(d, e) ? null : "hidden")
      })
  }
  function maxDepth(d) {
    return d.children ? Math.max.apply(Math, d.children.map(maxDepth)) : d.y + d.dy
  }
  function arcTween(d) {
    const xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
      yd = d3.interpolate(y.domain(), [d.y, maxDepth(d)]),
      yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius])
    return function (d) {
      return function (t) {
        x.domain(xd(t))
        y.domain(yd(t)).range(yr(t))
        return arc(d)
      }
    }
  }
  function isParentOf(p, c) {
    if (p === c) return true
    if (p.children) {
      return p.children.some(function (d) {
        return isParentOf(d, c)
      })
    }
    return false
  }
}
