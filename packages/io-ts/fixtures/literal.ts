import { literal, TypeOf } from 'io-ts';

// This file is generated by runtyping (https://github.com/johngeorgewright/runtyping).
// Manual changes might be lost - proceed with caution!
export const A = literal("foo");

export type A = TypeOf<typeof A>;

export const B = literal(2);

export type B = TypeOf<typeof B>;

export const C = literal(true);

export type C = TypeOf<typeof C>;
