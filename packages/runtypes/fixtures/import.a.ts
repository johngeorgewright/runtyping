import { Record, Static, String, Unknown } from 'runtypes';

export const A = Record({ foo: String, schema: Unknown, });

export type A = Static<typeof A>;
