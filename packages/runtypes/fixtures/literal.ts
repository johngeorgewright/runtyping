import { Literal, Static } from 'runtypes';

// This file is generated by runtyping (https://github.com/johngeorgewright/runtyping).
// Manual changes might be lost - proceed with caution!
export const A = Literal("foo");

export type A = Static<typeof A>;

export const B = Literal(2);

export type B = Static<typeof B>;

export const C = Literal(true);

export type C = Static<typeof C>;
