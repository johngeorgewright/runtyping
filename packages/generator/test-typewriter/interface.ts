export interface A {
  foo: string
  bar: number
  'has spaces': boolean
  '+1': boolean
  '-1': boolean
  __underscores__: boolean
  $dollar: boolean
  '${escaped template vars}': boolean
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
