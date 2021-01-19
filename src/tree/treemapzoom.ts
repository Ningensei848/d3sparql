/*
    Rendering sparql-results+json object into a zoomable treemap
  
    References:
      http://bost.ocks.org/mike/treemap/  Zoomable Treemaps
      http://bl.ocks.org/zanarmstrong/76d263bd36f312cb0f9f
  
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
        d3sparql.treemapzoom(json, config)
      }
  
    CSS/SVG:
      <style>
      rect {
        cursor: pointer;
      }
      .grandparent:hover rect {
        opacity: 0.8;
      }
      .children:hover rect.child {
        opacity: 0.2;
      }
      </style>
  */
d3sparql.treemapzoom = function (json, config) {
  config = config || {}

  const tree = json.head && json.results ? d3sparql.tree(json, config) : json

  const opts = {
    width: config.width || 800,
    height: config.height || 500,
    margin: config.margin || { top: 25, right: 0, bottom: 0, left: 0 },
    color: config.color || d3.scale.category20(),
    format: config.format || d3.format(",d"),
    selector: config.selector || null
  }

  const width = opts.width - opts.margin.left - opts.margin.right
  const height = opts.height - opts.margin.top - opts.margin.bottom
  const color = opts.color
  const format = opts.format
  let transitioning

  const x = d3.scale.linear().domain([0, width]).range([0, width])
  const y = d3.scale.linear().domain([0, height]).range([0, height])

  const treemap = d3.layout
    .treemap()
    .children(function (d, depth) {
      return depth ? null : d.children
    })
    .sort(function (a, b) {
      return a.value - b.value
    })
    .ratio((height / width) * 0.5 * (1 + Math.sqrt(5)))
    .round(false)

  const svg = d3sparql
    .select(opts.selector, "treemapzoom")
    .append("svg")
    .attr("width", opts.width)
    .attr("height", opts.height)
    .style("margin-left", -opts.margin.left + "px")
    .style("margin.right", -opts.margin.right + "px")
    .append("g")
    .attr("transform", "translate(" + opts.margin.left + "," + opts.margin.top + ")")
    .style("shape-rendering", "crispEdges")

  const grandparent = svg.append("g").attr("class", "grandparent")

  grandparent
    .append("rect")
    .attr("y", -opts.margin.top)
    .attr("width", width)
    .attr("height", opts.margin.top)
    .attr("fill", "#666666")

  grandparent
    .append("text")
    .attr("x", 6)
    .attr("y", 6 - opts.margin.top)
    .attr("dy", ".75em")
    .attr("stroke", "#ffffff")
    .attr("fill", "#ffffff")

  initialize(tree)
  layout(tree)
  display(tree)

  function initialize(tree) {
    tree.x = tree.y = 0
    tree.dx = width
    tree.dy = height
    tree.depth = 0
  }

  // Compute the treemap layout recursively such that each group of siblings
  // uses the same size (1×1) rather than the dimensions of the parent cell.
  // This optimizes the layout for the current zoom state. Note that a wrapper
  // object is created for the parent node for each group of siblings so that
  // the parent’s dimensions are not discarded as we recurse. Since each group
  // of sibling was laid out in 1×1, we must rescale to fit using absolute
  // coordinates. This lets us use a viewport to zoom.
  function layout(d) {
    if (d.children) {
      treemap.nodes({ children: d.children })
      d.children.forEach(function (c) {
        c.x = d.x + c.x * d.dx
        c.y = d.y + c.y * d.dy
        c.dx *= d.dx
        c.dy *= d.dy
        c.parent = d
        layout(c)
      })
    }
  }

  function display(d) {
    grandparent.datum(d.parent).on("click", transition).select("text").text(name(d))

    const g1 = svg.insert("g", ".grandparent").datum(d).attr("class", "depth")

    const g = g1.selectAll("g").data(d.children).enter().append("g")

    g.filter(function (d) {
      return d.children
    })
      .classed("children", true)
      .on("click", transition)

    g.selectAll(".child")
      .data(function (d) {
        return d.children || [d]
      })
      .enter()
      .append("rect")
      .attr("class", "child")
      .call(rect)

    g.append("rect")
      .attr("class", "parent")
      .call(rect)
      .append("title")
      .text(function (d) {
        return format(d.value)
      })

    g.append("text")
      .attr("dy", ".75em")
      .text(function (d) {
        return d.name
      })
      .call(text)

    function transition(d) {
      if (transitioning || !d) return
      transitioning = true
      const g2 = display(d),
        t1 = g1.transition().duration(750),
        t2 = g2.transition().duration(750)

      // Update the domain only after entering new elements.
      x.domain([d.x, d.x + d.dx])
      y.domain([d.y, d.y + d.dy])

      // Enable anti-aliasing during the transition.
      svg.style("shape-rendering", null)

      // Draw child nodes on top of parent nodes.
      svg.selectAll(".depth").sort(function (a, b) {
        return a.depth - b.depth
      })

      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0)

      // Transition to the new view.
      t1.selectAll("text").call(text).style("fill-opacity", 0)
      t2.selectAll("text").call(text).style("fill-opacity", 1)
      t1.selectAll("rect").call(rect)
      t2.selectAll("rect").call(rect)

      // Remove the old node when the transition is finished.
      t1.remove().each("end", function () {
        svg.style("shape-rendering", "crispEdges")
        transitioning = false
      })
    }
    return g
  }

  function text(text) {
    text
      .attr("x", function (d) {
        return x(d.x) + 6
      })
      .attr("y", function (d) {
        return y(d.y) + 6
      })
  }

  function rect(rect) {
    rect
      .attr("x", function (d) {
        return x(d.x)
      })
      .attr("y", function (d) {
        return y(d.y)
      })
      .attr("width", function (d) {
        return x(d.x + d.dx) - x(d.x)
      })
      .attr("height", function (d) {
        return y(d.y + d.dy) - y(d.y)
      })
      .attr("fill", function (d) {
        return color(d.name)
      })
    rect.attr({
      stroke: "#ffffff",
      "stroke-width": "1px",
      opacity: 0.8
    })
  }

  function name(d) {
    return d.parent ? name(d.parent) + " / " + d.name : d.name
  }
}
