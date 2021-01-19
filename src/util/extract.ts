const detectEndpointInSPARQL = (sparql: string): Array<string> => {
  /*
      Format for In-SPARQL-Endpoint:
      1. `## endpoint http://example.org/sparql`
      2. `# @endpoint http://dbpedia.org/sparql` (a.k.a. sparql-doc format)
    */

  // RegExp option: Global, Ignore case sensitivity, Multi line, Unicode support
  const defaultFormatPattern = /^##\sendpoint\s(\S+)\s/gimu
  const sparqlDocPattern = /^#\s@endpoint\s(\S+)\s/gimu
  const dfpEndpointList = [...sparql.matchAll(defaultFormatPattern)].map((match) => match[1])
  const sdpEndpointList = [...sparql.matchAll(sparqlDocPattern)].map((match) => match[1])
  const endpointSet = new Set(dfpEndpointList.concat(sdpEndpointList))
  return Array.from(endpointSet) // return Endpoint List
}

export default detectEndpointInSPARQL
