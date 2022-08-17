import { Static, Record, String, Unknown, Number } from 'runtypes';

export namespace A {
  export const B = Record({ C: String, });

  export type B = Static<typeof B>;

  export const C = Unknown;

  export type C = Static<typeof C>;

  export const D = Record({ E: Number, });

  export type D = Static<typeof D>;
}

export namespace B {
  export namespace C {
    export const D = Number;

    export type D = Static<typeof D>;
  }
}
