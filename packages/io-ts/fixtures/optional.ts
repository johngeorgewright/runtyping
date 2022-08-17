import { TypeOf, partial, union, string, undefined as Undefined } from 'io-ts';

export const A = partial({ foo: union([string, Undefined,]), });

export type A = TypeOf<typeof A>;
