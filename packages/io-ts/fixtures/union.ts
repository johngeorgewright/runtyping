import { number, string, TypeOf, union } from 'io-ts';

export const C = union([string, number,]);

export type C = TypeOf<typeof C>;
