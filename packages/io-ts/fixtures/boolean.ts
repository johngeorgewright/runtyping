import { boolean, TypeOf } from 'io-ts';

export const A = boolean;

export type A = TypeOf<typeof A>;
