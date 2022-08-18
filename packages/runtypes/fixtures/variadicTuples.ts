import { Array, Static, String } from 'runtypes';

export const A = Array(String).withConstraint(t => t.length >= 1);

export type A = Static<typeof A>;
