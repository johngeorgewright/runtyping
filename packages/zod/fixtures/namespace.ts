import { infer as Infer, object, string, unknown as Unknown, number } from 'zod';

export namespace A {
  export const B = object({ C: string(), });

  export type B = Infer<typeof B>;

  export const C = Unknown();

  export type C = Infer<typeof C>;

  export const D = object({ E: number(), });

  export type D = Infer<typeof D>;
}

export namespace B {
  export namespace C {
    export const D = number();

    export type D = Infer<typeof D>;
  }
}
