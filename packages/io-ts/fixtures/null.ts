import { intersection, null as Null, partial, string, type, TypeOf, undefined as Undefined, union } from 'io-ts';

export const A = Null;

export type A = TypeOf<typeof A>;

export const B = union([Null, string,]);

export type B = TypeOf<typeof B>;

export const C = intersection([type({ a: Null, b: union([Null, string,]), }), partial({ c: union([Null, string, Undefined,]), })]);

export type C = TypeOf<typeof C>;
