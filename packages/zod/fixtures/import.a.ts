import { any as Any, infer as Infer, object, string } from 'zod';

export const A = object({ foo: string(), schema: Any(), });

export type A = Infer<typeof A>;
