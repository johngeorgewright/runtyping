import { array, recursion, string, type, Type, TypeOf, union } from 'io-ts';
import { A as _A, B as _B } from '../../../.yarn/__virtual__/@runtyping-test-type-writers-virtual-f1a80c3a62/1/packages/test-type-writers/fixtures/source/recursive';

export const A: Type<_A> = recursion('A', () => type({ recurse: union([string, A,]), }));

export type A = TypeOf<typeof A>;

export const B: Type<_B> = recursion('B', () => type({ recurse: array(B), }));

export type B = TypeOf<typeof B>;
