import { InferOutput, literal } from 'valibot';

// This file is generated by runtyping (https://github.com/johngeorgewright/runtyping).
// Manual changes might be lost - proceed with caution!
export const A = literal("foo");

export type A = InferOutput<typeof A>;

export const B = literal(2);

export type B = InferOutput<typeof B>;

export const C = literal(true);

export type C = InferOutput<typeof C>;
