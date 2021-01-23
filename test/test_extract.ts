import detectEndpointInSPARQL, {
  pattern_comment,
  pattern_delete_quote,
  pattern_endpoint,
  tryAddFirstElem
} from "@/util/extract"
import { isValidEndpoint } from "@/util/validation"

const url01 = "https://dbpedia.org/sparql"
const comment01 = `# @endpoint url=${url01}`
const url02 = "https://query.wikidata.org/bigdata/namespace/wdq/sparql"
const comment02 = `# @endpoint urls=["${url01}", "${url02}"]`
const sparql01 = `${comment01}
${comment02}
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT * WHERE {
  ?sub ?pred ?obj .
} LIMIT 10
`
const sparql02 = `# @endpoint urls01=[
#    "${url01}",
#    "${url02}"
# ]

PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT * WHERE {
  ?sub ?pred ?obj .
} LIMIT 10
`
const sparql03 = ""

test("pattern", () => {
  expect(Array.isArray(detectEndpointInSPARQL(sparql01))).toBeTruthy()
  expect(sparql01.split("\n").filter((line) => /^#+\s*\S+/.exec(line))).toContain(comment01)
  expect(sparql01.split("\n").filter((line) => /^#+\s*\S+/.exec(line))).toContain(comment02)
  expect(pattern_endpoint.exec(comment01)).toBeTruthy()
  expect(pattern_endpoint.exec(comment02)).toBeTruthy()
  const temp01 = '# "hoge"'
  expect(temp01.replace(pattern_comment, "$1")).toBe('"hoge"')
  expect(temp01.replace(pattern_comment, "$1").replace(pattern_delete_quote, "$1")).toBe("hoge")
})

// const pattern_braket = /\[(.*?)(?<!\\)\]/
const makeCand = (comments: string[]): { [key: string]: Array<string> } => {
  const candidates: { [key: string]: Array<string> } = {}
  let varName = ""
  for (const line of comments) {
    const m = pattern_endpoint.exec(line)
    if (m) {
      varName = m[1]
      candidates[varName] = Array(m[2])
    } else {
      if (candidates[varName]) {
        candidates[varName].push(line)
      } else {
        continue
      }
    }
  }
  return candidates
}

test("detectEndpointInSPARQL", () => {
  const comments = [comment01, comment02]
  const candidates = makeCand(comments)
  expect(Object.keys(candidates)).toContain("url")
  const pattern_test = /["[']*(.*?)(?<!\\)["\]',]+/

  expect(`["https://dbpedia.org/sparql"]`.replace(pattern_test, "$1")).toBe(url01) // remain braket
  expect("https://dbpedia.org/sparql".replace(pattern_test, "$1")).toBe(url01) // remain braket
  expect('https://dbpedia.org/sparql"]'.replace(pattern_test, "$1")).toBe(url01) // remain braket
  expect("'https://dbpedia.org/sparql'".replace(pattern_test, "$1")).toBe(url01) // remain braket

  expect(detectEndpointInSPARQL(sparql01)).toContain(url01)
  expect(detectEndpointInSPARQL(sparql01)).toContain(url02)

  expect(detectEndpointInSPARQL(sparql01)).toEqual([url01, url02])
})

test("multiple comments", () => {
  const comments = sparql02.split("\n").filter((line) => pattern_comment.exec(line))
  let endpoints: Array<string> = []
  for (const valueList of Object.values(makeCand(comments))) {
    const first = valueList.shift()
    endpoints = endpoints.concat(tryAddFirstElem(first))
    if (!valueList) {
      continue
    } else {
      const urlList = valueList.map((line) =>
        line.replace(pattern_comment, "$1").trim().replace(pattern_delete_quote, "$1")
      )
      endpoints = endpoints.concat(urlList)
    }
  }
  expect(endpoints[0]).toBe("[")
  expect(endpoints.filter((elem) => isValidEndpoint(elem))).toContain(url01)
  expect(detectEndpointInSPARQL(sparql02)).toEqual([url01, url02])
  expect(detectEndpointInSPARQL(sparql03)).toEqual([])
})
