import { string, type, TypeOf, unknown as Unknown } from 'io-ts';

export const A = type({ foo: string, schema: Unknown, });

export type A = TypeOf<typeof A>;
