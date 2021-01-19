/*
    Rendering sparql-results+json object containing one row into a HTML table
  
    Options:
      config = {
        "selector": "#result"
      }
  
    Synopsis:
      d3sparql.query(endpoint, sparql, render)
  
      function render(json) {
        var config = { ... }
        d3sparql.htmlhash(json, config)
      }
  
    CSS:
      <style>
      table {
        margin: 10px;
      }
      th {
        background: #eeeeee;
      }
      th:first-letter {
         text-transform: capitalize;
      }
      </style>
  */
d3sparql.htmlhash = function (json, config) {
  config = config || {}

  const head = json.head.vars
  const data = json.results.bindings[0]

  const opts = {
    selector: config.selector || null
  }

  const table = d3sparql.select(opts.selector, "htmlhash").append("table").attr("class", "table table-bordered")
  const tbody = table.append("tbody")
  const row = tbody
    .selectAll("tr")
    .data(function () {
      return head.map(function (col) {
        return { head: col, data: data[col] ? data[col].value : "" }
      })
    })
    .enter()
    .append("tr")
  row.append("th").text(function (d) {
    return d.head
  })
  row.append("td").text(function (d) {
    return d.data
  })

  // default CSS
  table.style({
    margin: "10px"
  })
  table.selectAll("th").style({
    background: "#eeeeee",
    "text-transform": "capitalize"
  })
}
