import { Static, Boolean } from 'runtypes';

export const A = Boolean;

export type A = Static<typeof A>;
