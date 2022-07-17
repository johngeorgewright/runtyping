interface A {
  foo: string
}

export type B = Array<string | number | A>
