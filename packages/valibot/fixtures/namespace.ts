import { InferOutput, number, object, string, unknown } from 'valibot';

// This file is generated by runtyping (https://github.com/johngeorgewright/runtyping).
// Manual changes might be lost - proceed with caution!
export namespace A {
  export const B = object({ C: string(), });

  export type B = InferOutput<typeof B>;

  export const C = unknown();

  export type C = InferOutput<typeof C>;

  export const D = object({ E: number(), });

  export type D = InferOutput<typeof D>;
}

export namespace B {
  export namespace C {
    export const D = number();

    export type D = InferOutput<typeof D>;
  }
}
