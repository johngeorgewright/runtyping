import { Number, Static, String, Tuple } from 'runtypes';

// This file is generated by runtyping (https://github.com/johngeorgewright/runtyping).
// Manual changes might be lost - proceed with caution!
export const A = Tuple(Number, String, Number,);

export type A = Static<typeof A>;

export const B = Tuple(A, A,);

export type B = Static<typeof B>;

export const C = Tuple();

export type C = Static<typeof C>;
