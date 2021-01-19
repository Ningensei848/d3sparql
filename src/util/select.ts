// function を定義してdefault export するだけでいい

import * as d3 from "d3"

const select = (selector: HTMLElement | SVGAElement, type: string): unknown => {
  if (selector) {
    return d3
      .select(selector)
      .html("")
      .append("div")
      .attr("class", "d3sparql " + type)
  } else {
    return d3
      .select("body")
      .append("div")
      .attr("class", "d3sparql " + type)
  }
}

export default select
