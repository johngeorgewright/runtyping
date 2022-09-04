export interface A<T> {
  type: T
}

export interface B<T extends string> {
  type: T
}

export type C<T> = T | string

export type D<T extends number> = { type: T }

export interface E {
  foo: string
}

export interface F<T extends E> {
  type: T
}

export type G = {
  abc: A<{ data: string }>
}

type Test<T> = T & { count: number }

export type Foo = {
  abc: Test<{ data: string }>
}
