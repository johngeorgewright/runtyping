import { literal, number, object, output, string } from 'zod';

// This file is generated by runtyping (https://github.com/johngeorgewright/runtyping).
// Manual changes might be lost - proceed with caution!
export const C = object({ bar: string(), foo: string(), });

export type C = output<typeof C>;

export const D = object({ bar: number(), moo: string(), foo: number(), car: string(), });

export type D = output<typeof D>;

export const E = object({ imported: literal(true), });

export type E = output<typeof E>;
