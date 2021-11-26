import { A as E } from './inheritance.import'

interface B {
  foo: string
}

export interface C extends B {
  bar: string
}

export interface D extends E {
  bar: number
  moo: string
}
