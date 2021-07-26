export interface A {
  (foo: string, bar: number): void
}

export type B = (bar: number) => void

export interface C {
  (foo: string): B
  (foo: string, bar: number): void
  (foo: string, bar?: number): any
}
