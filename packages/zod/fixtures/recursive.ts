import { array, infer as Infer, lazy, object, string, ZodType } from 'zod';
import { A as _A, B as _B } from '../../../.yarn/__virtual__/@runtyping-test-type-writers-virtual-f1a80c3a62/1/packages/test-type-writers/fixtures/source/recursive';

export const A: ZodType<_A> = lazy(() => object({ recurse: string().or(A), }));

export type A = Infer<typeof A>;

export const B: ZodType<_B> = lazy(() => object({ recurse: array(B), }));

export type B = Infer<typeof B>;
