export interface A {
  foo: string
  bar: number
}

export interface B {
  a: A
  b: 'B'
}

export interface C {
  foo(): string
  get bar(): number
  set bar(x: number)
  boo(x: string): void
}
