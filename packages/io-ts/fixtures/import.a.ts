import { string, type, TypeOf } from 'io-ts';

export const A = type({ foo: string, });

export type A = TypeOf<typeof A>;
