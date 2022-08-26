import { Number, Static, String } from 'runtypes';

export const C = String.Or(Number);

export type C = Static<typeof C>;
