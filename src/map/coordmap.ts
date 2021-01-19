/*
    World Map spotted by coordinations (longitude and latitude)
  
    Options:
      config = {
        "var_lat":  "lat",     // SPARQL variable name for latitude (optional; default is the 1st variable)
        "var_lng":  "lng",     // SPARQL variable name for longitude (optional; default is the 2nd variable)
        "width":    960,       // canvas width (optional)
        "height":   480,       // canvas height (optional)
        "radius":   5,         // circle radius (optional)
        "color":    "#FF3333,  // circle color (optional)
        "topojson": "path/to/world-50m.json",  // TopoJSON file
        "selector": "#result"
      }
  
    Synopsis:
      d3sparql.query(endpoint, sparql, render)
  
      function render(json) {
        d3sparql.coordmap(json, config = {})
      }
  
    Dependencies:
      * topojson.js
        * Download from http://d3js.org/topojson.v1.min.js
        * Put <script src="topojson.js"></script> in the HTML <head> section
      * world-50m.json
        * Download from https://github.com/mbostock/topojson/blob/master/examples/world-50m.json
  */
d3sparql.coordmap = function (json, config) {
  config = config || {}

  const head = json.head.vars
  const data = json.results.bindings

  const opts = {
    var_lat: config.var_lat || head[0] || "lat",
    var_lng: config.var_lng || head[1] || "lng",
    width: config.width || 960,
    height: config.height || 480,
    radius: config.radius || 5,
    color: config.color || "#FF3333",
    topojson: config.topojson || "world-50m.json",
    selector: config.selector || null
  }

  const projection = d3.geo
    .equirectangular()
    .scale(153)
    .translate([opts.width / 2, opts.height / 2])
    .precision(0.1)
  const path = d3.geo.path().projection(projection)
  const graticule = d3.geo.graticule()
  const svg = d3sparql
    .select(opts.selector, "coordmap")
    .append("svg")
    .attr("width", opts.width)
    .attr("height", opts.height)

  svg.append("path").datum(graticule.outline).attr("fill", "#a4bac7").attr("d", path)

  svg
    .append("path")
    .datum(graticule)
    .attr("fill", "none")
    .attr("stroke", "#333333")
    .attr("stroke-width", ".5px")
    .attr("stroke-opacity", ".5")
    .attr("d", path)

  d3.json(opts.topojson, function (error, world) {
    svg
      .insert("path", ".graticule")
      .datum(topojson.feature(world, world.objects.land))
      .attr("fill", "#d7c7ad")
      .attr("stroke", "#766951")
      .attr("d", path)

    svg
      .insert("path", ".graticule")
      .datum(
        topojson.mesh(world, world.objects.countries, function (a, b) {
          return a !== b
        })
      )
      .attr("class", "boundary")
      .attr("fill", "none")
      .attr("stroke", "#a5967e")
      .attr("stroke-width", ".5px")
      .attr("d", path)

    svg
      .selectAll(".pin")
      .data(data)
      .enter()
      .append("circle", ".pin")
      .attr("fill", opts.color)
      .attr("r", opts.radius)
      .attr("stroke", "#455346")
      .attr("transform", function (d) {
        return "translate(" + projection([d[opts.var_lng].value, d[opts.var_lat].value]) + ")"
      })
  })
}
