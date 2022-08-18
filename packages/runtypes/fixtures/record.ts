import { Dictionary, Static, String } from 'runtypes';

export const A = Dictionary(String, String);

export type A = Static<typeof A>;
