import { array, infer as Infer, number, object, string } from 'zod';

// This file is generated by runtyping (https://github.com/johngeorgewright/runtyping).
// Manual changes might be lost - proceed with caution!
export const A = object({ foo: string(), });

export type A = Infer<typeof A>;

export const B = array(string().or(number()).or(A));

export type B = Infer<typeof B>;
