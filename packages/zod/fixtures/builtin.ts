import { infer as Infer, instanceof as InstanceOf, object } from 'zod';

export const A = object({ a: InstanceOf(Uint8Array), });

export type A = Infer<typeof A>;
