import { isValidEndpoint } from "@/util/validation"

export const pattern_comment = /^\s*#+\s*(\S+)/
export const pattern_endpoint = /^\s*#+\s*@endpoint\s+(\w+)\s*=\s*([[{]*[^\]}]+[\]}]*)/i
export const pattern_delete_quote = /["[']*(.*?)(?<!\\)["\]',]+/

export const tryAddFirstElem = (elem: string | undefined): string[] => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const hoge: Array<string> = JSON.parse(elem ? elem : "")
    if (!Array.isArray(hoge)) {
      // pass
    } else {
      return hoge
    }
  } catch (error) {
    console.warn(error)
  }
  return elem ? [elem.replace(pattern_delete_quote, "$1")] : []
}

export const detectEndpointInSPARQL = (sparql: string): Array<string> => {
  const comments = sparql.split("\n").filter((line) => pattern_comment.exec(line))
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

  let endpoints: Array<string> = []

  for (const valueList of Object.values(candidates)) {
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

  // valid url and uniq()
  return [...new Set(endpoints.filter((elem) => isValidEndpoint(elem)))]
}

export default detectEndpointInSPARQL
