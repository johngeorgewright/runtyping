export enum A {
  A1,
  B1,
  C1,
}

export enum B {
  A2 = 'a',
  B2 = 'b',
}

export enum C {
  A3,
  B3,
  C3,
}

export type D = C.A3 | C.B3

export enum E {
  S,
}

export type F = string | E

export type G = C | E
