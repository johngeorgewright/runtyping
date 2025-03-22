import { array, custom, InferOutput, intersect, never, record, string } from 'valibot';

// This file is generated by runtyping (https://github.com/johngeorgewright/runtyping).
// Manual changes might be lost - proceed with caution!
export const A = never();

export type A = InferOutput<typeof A>;

export const B = intersect([record(string(), never()), custom((data) => !Array.isArray(data), "Unexpected array")]);

export type B = InferOutput<typeof B>;

export const C = array(never());

export type C = InferOutput<typeof C>;
