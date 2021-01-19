/*
    World Map colored by location names defined in a TopoJSON file
  
    Options:
      config = {
        "label":       "name",    // SPARQL variable name for location names (optional; default is the 1st variable)
        "value":       "size",    // SPARQL variable name for numerical values (optional; default is the 2nd variable)
        "width":       1000,      // canvas width (optional)
        "height":      1000,      // canvas height (optional)
        "color_max":   "blue",    // color for maximum value (optional)
        "color_min":   "white",   // color for minimum value (optional)
        "color_scale": "linear"   // color scale (optional; "linear" or "log")
        "topojson":    "path/to/japan.topojson",  // TopoJSON file
        "mapname":     "japan",   // JSON key name of a map location root (e.g., "objects":{"japan":{"type":"GeometryCollection", ...)
        "keyname":     "name",    // JSON key name of map locations matched with "label" (e.g., "properties":{"name":"Tokyo", ...)
        "center_lat":  34,        // latitude for a map location center (optional; default is 34 for Japan)
        "center_lng":  137,       // longitude for a map location center (optional; default is 137 for Japan)
        "scale":       10000,     // scale of rendering (optional)
        "selector":    "#result"
      }
  
    Synopsis:
      d3sparql.query(endpoint, sparql, render)
  
      function render(json) {
        d3sparql.namedmap(json, config = {})
      }
  
    Dependencies:
      * topojson.js
        * Download from http://d3js.org/topojson.v1.min.js
        * Put <script src="topojson.js"></script> in the HTML <head> section
      * japan.topojson
        * Download from https://github.com/sparql-book/sparql-book/blob/master/chapter5/D3/japan.topojson
  */
d3sparql.namedmap = function (json, config) {
  config = config || {}

  const head = json.head.vars
  const data = json.results.bindings

  const opts = {
    label: config.label || head[0] || "label",
    value: config.value || head[1] || "value",
    width: config.width || 1000,
    height: config.height || 1000,
    color_max: config.color_max || "red",
    color_min: config.color_min || "white",
    color_scale: config.color_scale || "log",
    topojson: config.topojson || "japan.topojson",
    mapname: config.mapname || "japan",
    keyname: config.keyname || "name_local",
    center_lat: config.center_lat || 34,
    center_lng: config.center_lng || 137,
    scale: config.scale || 10000,
    selector: config.selector || null
  }

  const size = d3
    .nest()
    .key(function (d) {
      return d[opts.label].value
    })
    .rollup(function (d) {
      return d3.sum(d, function (d) {
        return parseInt(d[opts.value].value)
      })
    })
    .map(data, d3.map)
  const extent = d3.extent(d3.map(size).values())

  if (d3sparql.debug) {
    console.log(JSON.stringify(size))
  }

  const svg = d3sparql
    .select(opts.selector, "namedmap")
    .append("svg")
    .attr("width", opts.width)
    .attr("height", opts.height)

  d3.json(opts.topojson, function (topojson_map) {
    const geo = topojson.object(topojson_map, topojson_map.objects[opts.mapname]).geometries
    const projection = d3.geo
      .mercator()
      .center([opts.center_lng, opts.center_lat])
      .translate([opts.width / 2, opts.height / 2])
      .scale(opts.scale)
    const path = d3.geo.path().projection(projection)
    switch (opts.color_scale) {
      case "log":
        var scale = d3.scale.log()
        break
      default:
        var scale = d3.scale.linear()
        break
    }
    const color = scale.domain(extent).range([opts.color_min, opts.color_max])

    svg
      .selectAll("path")
      .data(geo)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .style("fill", function (d, i) {
        // map SPARQL results to colors
        return color(size[d.properties[opts.keyname]])
      })

    svg
      .selectAll(".place-label")
      .data(geo)
      .enter()
      .append("text")
      .attr("font-size", "8px")
      .attr("class", "place-label")
      .attr("transform", function (d) {
        const lat = d.properties.latitude
        const lng = d.properties.longitude
        return "translate(" + projection([lng, lat]) + ")"
      })
      .attr("dx", "-1.5em")
      .text(function (d) {
        return d.properties[opts.keyname]
      })
  })
}
