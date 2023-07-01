export type DataResponse<T, E> = Promise<{data: T | null, error: E | null}>

export type Lazy<T> = () => T

// Credit https://stackoverflow.com/questions/41253310/typescript-retrieve-element-type-information-from-array-type
export type ArrayElement<ArrayType extends readonly unknown[]> = 
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
