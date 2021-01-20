export interface Option {
  key1?: string
  key2?: string
  label1?: string
  label2?: string
  value1?: string
  value2?: string
}

export interface GraphConfig {
  key1: string
  key2: string
  label1: string | false
  label2: string | false
  value1: string | false
  value2: string | false
}

export interface Nodes {
  key: string
  label: string | false
  value: string | false
}

export interface Edges {
  source?: number
  target?: number
}

export interface Graph {
  nodes: Array<Nodes>
  edges: Array<Edges>
}
