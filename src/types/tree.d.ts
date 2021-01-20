// cf. https://megalodon.jp/2021-0120-0947-22/https://qiita.com:443/sotszk/items/efe32e07e52dce329653
export interface treeConfig {
  root: string
  parent: string
  child: string
  value: string
}

export interface Tree {
  name: string
  value: number
  children?: Tree[]
}

export interface Hogehoge {
  pair: { [key: string]: Array<string> }
  size: { [key: string]: number }
}

export interface TraverseProps extends Hogehoge {
  nodeName: string
}
