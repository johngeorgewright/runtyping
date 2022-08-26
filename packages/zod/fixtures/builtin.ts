import { infer as Infer, instanceof as InstanceOf, object } from 'zod';

// This file is generated by runtyping (https://github.com/johngeorgewright/runtyping).
// Manual changes might be lost - proceed with caution!
export const A = object({ a: InstanceOf(Uint8Array), });

export type A = Infer<typeof A>;
