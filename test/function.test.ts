import generateFixture from './generateFixture'

test('function', async () => {
  expect((await generateFixture('function', ['A', 'B', 'C', 'D'])).getText())
    .toMatchInlineSnapshot(`
    "import { A as _A, B as _B, C as _C, D as _D } from './function';
    import { Contract, String, Number, Void, Static, Unknown } from 'runtypes';

    export const A = Contract(String, Number, Void);

    export type A = _A;

    export const B = Contract(Number, Void);

    export type B = _B;

    export const C = Contract(String, Number, Unknown);

    export type C = _C;

    export const D = Contract(Number, String).enforce(_D);

    export type D = typeof D;
    "
  `)
})
