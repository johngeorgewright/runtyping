export namespace A {
  export interface B {
    C: string
  }
}

export namespace B {
  export namespace C {
    export type D = number
  }
}

export namespace A {
  export type C = unknown
}
