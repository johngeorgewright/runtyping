import { function as func, infer as Infer, number, string, void as Void } from 'zod';

export const A = func().args(string(), number(),).returns(Void());

export type A = Infer<typeof A>;
