import { TypeOf, tuple, number, string } from 'io-ts';
import { validators } from '@runtyping/io-ts';

export const A = validators.arrayOfLength<[unknown, unknown, unknown]>(3).pipe(tuple([number, string, number,]));

export type A = TypeOf<typeof A>;

export const B = validators.arrayOfLength<[unknown, unknown]>(2).pipe(tuple([A, A,]));

export type B = TypeOf<typeof B>;

export const C = validators.emptyTuple;

export type C = TypeOf<typeof C>;
