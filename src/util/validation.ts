import { errorMessage } from "@/util/error"
import { Parser } from "sparqljs"

const sparqlParser = new Parser()

// validation for URL-string
export const isValidEndpoint = (endpoint: string): boolean => {
  try {
    new URL(endpoint) // as endpoint validation
    return true
  } catch (error) {
    errorMessage(error, "endpoint", endpoint, "URL()")
    return false
  }
}

export const isValidSparql = (sparql: string): boolean => {
  try {
    sparqlParser.parse(sparql) // as endpoint validation
    return true
  } catch (error) {
    errorMessage(error, "sparql", sparql, "sparqlParser.parse()")
    return false
  }
}
