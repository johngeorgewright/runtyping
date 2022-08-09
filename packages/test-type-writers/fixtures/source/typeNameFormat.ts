interface A {
  foo: string
}

export type B = {
  bar: A
  baz: A
  nest: {
    baz2: A[]
  }
}
