import fetch from "@/library/d3sparql/util/fetch"
import { AxiosRequestConfig, AxiosResponse } from "axios"
import { Parser } from "sparqljs"

const sparqlParser = new Parser()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ErrorMessage = (error: Error, title: string, variable: any, target?: string): void => {
  if (target) {
    console.error(
      `Given ${title}: `,
      variable,
      `is invalid. The \`${target}\` emitted "${error.name}: ${error.message}".`
    )
  } else {
    console.error(`Given ${title}: `, variable, `is invalid. Please check!\n=> "${error.name}: ${error.message}".`)
  }
  console.error(error)
}

// validation for URL-string
const isValidEndpoint = (endpoint: string): boolean => {
  try {
    new URL(endpoint) // as endpoint validation
    return true
  } catch (error) {
    ErrorMessage(error, "endpoint", endpoint, "URL()")
    return false
  }
}

const isValidSparql = (sparql: string): boolean => {
  try {
    sparqlParser.parse(sparql) // as endpoint validation
    return true
  } catch (error) {
    ErrorMessage(error, "sparql", sparql, "sparqlParser.parse()")
    return false
  }
}

const makeConfig = (url: URL, config?: AxiosRequestConfig): AxiosRequestConfig => {
  const queryParams = [...url.searchParams.entries()].reduce((l, [k, v]) => Object.assign(l, { [k]: v }), {}) // cf. https://bit.ly/2K8KIK9
  const configFromUrl = {
    url: url.pathname,
    baseURL: url.origin,
    params: queryParams
  }

  if (config) {
    // 連想配列の結合，後ろから上書きする模様 cf. https://bit.ly/36CyaSU
    return { ...config, ...configFromUrl }
  } else {
    return configFromUrl
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const query = (sparql: string, endpoint?: string, config?: AxiosRequestConfig): Promise<any> => {
  /*
    Args:
        sparql: SPARQL Query
        endpoint?: endpoint URL (only single, not multiple)
        config?: Axios config object
    caution:
        1. If you specify `endpoint` and also specify `config.url` (in other words, if axios.getUri() returns its value),
        `config` will be overwritten by `endpoint`.
        2. If you specify endpoint(s) or other comments in `sparql` via Syntax Extension (i.e. "SPARQL-Doc"),
        they will be ignored. (not be removed, but no be touched)
  */

  if (isValidSparql(sparql)) {
    // pass
  } else {
    throw new Error("Query is invalid. Please Pass correct SPARQL Query as `sparql`.")
  }

  // for endpoint: after IF-statement below, obtain validated-url or undefined object
  let url!: URL
  if (endpoint) {
    // endpointがあったら，検証して「クエリURL」を得る
    try {
      // TODO: SPARQL Validation
      const encodedQuery = encodeURIComponent(sparql)
      if (isValidEndpoint(endpoint)) {
        url = new URL(endpoint + "?query=" + encodedQuery)
      }
    } catch (error) {
      if (error instanceof URIError) {
        ErrorMessage(error, "sparql", sparql, "encodeURIComponent()")
      } else if (error instanceof TypeError) {
        ErrorMessage(error, "endpoint", endpoint, "URL()")
      }
    }
  }

  // Request config: cf. https://github.com/axios/axios#request-config
  const defaultConfig = {
    headers: {
      "Content-Type": "application/sparql-results+json"
    }
  }

  let queryConfig: AxiosRequestConfig
  if (!config && url) {
    // デフォルト設定をつくって（あるいは作らずに）GETする
    queryConfig = { method: "get", url: url.href }
  } else if (config && url) {
    // configの`url`, `baseURL`, `params`を上書きしてGETする
    queryConfig = makeConfig(url, config)
  } else if (config && !url) {
    // configの`url`, `baseURL`, `params`があることを検証してGETする
    queryConfig = makeConfig(url, config) // ここなんかヤバそう
  } else {
    // GETできない（のでエラーを返す
    throw new Error("Please Pass correct information about Endpoint as `endpoint` or `config.url`")
  }

  // default configで上書きしてFetchに渡す

  // const res = await fetch({ ...queryConfig, ...defaultConfig })
  // // console.log('data is ', res.data)
  // return res.data

  // Response Schema in SPARQL
  //   - SPARQL 1.1 Query Results JSON Format: cf. https://www.w3.org/TR/2013/REC-sparql11-results-json-20130321/
  //   - SPARQL 1.1 Query Results CSV and TSV Formats:  cf. https://www.w3.org/TR/2013/REC-sparql11-results-csv-tsv-20130321/
  //   - SPARQL Query Results XML Format (Second Edition): cf. https://www.w3.org/TR/2013/REC-rdf-sparql-XMLres-20130321/
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = async (): Promise<any> => {
    try {
      const res: AxiosResponse = await fetch({ ...queryConfig, ...defaultConfig })
      console.log("Response: ", res)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return res.data
    } catch (error) {
      console.error(error)
    }
  }

  return response()
}
