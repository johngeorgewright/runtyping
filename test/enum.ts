export enum A {
  A,
  B,
  C,
}

export enum B {
  A = 'a',
  B = 'b',
}

export enum C {
  A,
  B,
  C,
}

export type D = C.A | C.B
