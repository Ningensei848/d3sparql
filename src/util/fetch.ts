/*
    d3.json sometimes fails to retrieve "application/sparql-results+json" as it is designed for "application/json"
    d3.json(url, function(error, json) {
    if (d3sparql.debug) { console.log(error) }
    if (d3sparql.debug) { console.log(json) }
    callback(json)
    })
*/

// Definitely Types: cf. https://github.com/axios/axios/blob/master/test/typescript/axios.ts
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetch = async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
  const res = await axios
    .request(config)
    .then((response: AxiosResponse) => {
      return response
    })
    .catch((error: AxiosError) => {
      console.error("axios Error is happen: ", error)
      throw new Error(
        "Fetch data was failed. \nPlease confirm your 1. `config` 2. network connection (e.g. Proxy) 3. other reason."
      )
    })
  return res
}

export default fetch
