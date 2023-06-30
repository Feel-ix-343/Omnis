export type DataResponse<T, E> = Promise<{data: T | null, error: E | null}>

export type MaybeLazy<T> = T | (() => T)
