import { Static, Unknown } from 'runtypes';

export const A = Unknown;

export type A = Static<typeof A>;

export const B = Unknown;

export type B = Static<typeof B>;
