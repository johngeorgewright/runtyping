export interface A {
  (foo: string, bar: number): void
}

export type B = (bar?: number) => void

export interface C {
  (foo: string): B
  (foo: string, bar: number): void
}

export function D(foo: number) {
  return foo + 'foo'
}

export async function E(foo: number) {
  return D(foo)
}

export const F = (foo: number) => foo.toString()

export function G(foo: number): number
export function G(foo: string): string
export function G(foo: string | number): string | number {
  return foo
}
