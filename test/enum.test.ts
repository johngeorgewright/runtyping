import generateFixture from './generateFixture'

test('enum', async () => {
  expect((await generateFixture('enum', ['A', 'B', 'D'])).getText())
    .toMatchInlineSnapshot(`
    "import { A as _A, B as _B, C as _C } from './enum';
    import { Guard, Static, Literal } from 'runtypes';

    export const A = Guard((x: any): x is _A => Object.values(_A).includes(x));

    export type A = Static<typeof A>;

    export const B = Guard((x: any): x is _B => Object.values(_B).includes(x));

    export type B = Static<typeof B>;

    export const D = Literal(_C.A).Or(Literal(_C.B));

    export type D = Static<typeof D>;
    "
  `)
})
