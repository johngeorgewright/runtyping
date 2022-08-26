import { Record, Static, String, Undefined } from 'runtypes';

export const A = Record({ foo: String.Or(Undefined).optional(), });

export type A = Static<typeof A>;
