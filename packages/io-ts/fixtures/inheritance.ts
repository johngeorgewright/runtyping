import { literal, number, string, type, TypeOf } from 'io-ts';

export const C = type({ bar: string, foo: string, });

export type C = TypeOf<typeof C>;

export const D = type({ bar: number, moo: string, foo: number, car: string, });

export type D = TypeOf<typeof D>;

export const E = type({ imported: literal(true), });

export type E = TypeOf<typeof E>;
