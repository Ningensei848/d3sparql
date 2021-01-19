// cf. ja-JP: http://www.asahi-net.or.jp/~ax2s-kmtn/internet/rdf/REC-sparql11-results-json-20130321.html
// cf. org: https://www.w3.org/TR/2013/REC-sparql11-results-json-20130321/

export type IRI = {
  type: "uri"
  value: string
}
export type Literal = {
  type: "literal"
  value: string
}
export type LiteralWithLanguageTag = {
  type: "literal"
  value: string
  "xml:lang": string
}
export type LiteralWithDatatypeIRI = {
  type: "literal"
  value: string
  datatype: string
}
export type Blank = {
  type: "bnode"
  value: string
}

export type RDFTerm = IRI | Literal | LiteralWithLanguageTag | LiteralWithDatatypeIRI | Blank

export interface Results {
  bindings: Array<{ [key: string]: RDFTerm }>
}
export type Head = {
  vars?: string[]
  link?: string[]
}
export interface ResultsMemberJSONResponse {
  head: Head
  results: Results
}
export interface BooleanMemberJSONResponse {
  head: Head
  boolean: boolean
}

export type JSONResponse = import("@/types/type-fest").MergeExclusive<
  ResultsMemberJSONResponse,
  BooleanMemberJSONResponse
>
