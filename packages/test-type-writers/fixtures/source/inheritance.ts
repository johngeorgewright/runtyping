import { A as F } from './inheritance.import'

export interface A {
  foo: number
  bar: number
  car: string
}

interface B {
  foo: string
}

export interface C extends B {
  bar: string
}

export interface D extends A {
  bar: number
  moo: string
}

export interface E extends F {}
