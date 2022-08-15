import { TypeOf, type, string, unknown as Unknown, number } from 'io-ts'

export namespace A {
  export const B = type({ C: string })

  export type B = TypeOf<typeof B>

  export const C = Unknown

  export type C = TypeOf<typeof C>

  export const D = type({ E: number })

  export type D = TypeOf<typeof D>
}

export namespace B {
  export namespace C {
    export const D = number

    export type D = TypeOf<typeof D>
  }
}
