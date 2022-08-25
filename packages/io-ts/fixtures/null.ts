import { intersection, null as Null, partial, string, type, TypeOf, undefined as Undefined, union } from 'io-ts';

// This file is generated by runtyping (https://github.com/johngeorgewright/runtyping).
// Manual changes might be lost - proceed with caution!
export const A = Null;

export type A = TypeOf<typeof A>;

export const B = union([Null, string,]);

export type B = TypeOf<typeof B>;

export const C = intersection([type({ a: Null, b: union([Null, string,]), }), partial({ c: union([Null, string, Undefined,]), })]);

export type C = TypeOf<typeof C>;
