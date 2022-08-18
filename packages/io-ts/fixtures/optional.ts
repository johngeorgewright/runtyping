import { partial, string, TypeOf, undefined as Undefined, union } from 'io-ts';

export const A = partial({ foo: union([string, Undefined,]), });

export type A = TypeOf<typeof A>;
