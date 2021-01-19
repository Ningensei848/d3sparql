// cf. https://megalodon.jp/2021-0120-0011-13/https://dev.classmethod.jp:443/articles/error-handling-practice-of-typescript/

class Success<T, E> {
  constructor(readonly value: T) {}
  type = "success" as const // ここを追加
  isSuccess(): this is Success<T, E> {
    return true
  }
  isFailure(): this is Failure<T, E> {
    return false
  }
}

class Failure<T, E> {
  constructor(readonly value: E) {}
  type = "failure" as const // ここを追加
  isSuccess(): this is Success<T, E> {
    return false
  }
  isFailure(): this is Failure<T, E> {
    return true
  }
}

export type Result<T, E> = Success<T, E> | Failure<T, E>
