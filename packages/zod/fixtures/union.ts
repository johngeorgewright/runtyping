import { infer as Infer, number, string } from 'zod';

export const C = string().or(number());

export type C = Infer<typeof C>;
