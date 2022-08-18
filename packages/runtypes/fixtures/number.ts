import { Number, Static } from 'runtypes';

export const A = Number;

export type A = Static<typeof A>;
