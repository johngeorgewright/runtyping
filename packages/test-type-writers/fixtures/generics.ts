export interface A<T> {
  type: T
}

export interface B<T extends string> {
  type: T
}

export type C<T> = { type: T }

export type D<T extends number> = { type: T }

export interface E {
  foo: string
}

export interface F<T extends E> {
  type: T
}
