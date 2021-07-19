import generateFixture from './generateFixture'

test('enum', async () => {
  expect((await generateFixture('enum', ['A', 'B'])).getText())
    .toMatchInlineSnapshot(`
    "import { A as _A, B as _B } from './enum';
    import { Guard, Static } from 'runtypes';

    export const A = Guard((x: any): x is _A => Object.values(_A).includes(x));

    export type A = Static<typeof A>;

    export const B = Guard((x: any): x is _B => Object.values(_B).includes(x));

    export type B = Static<typeof B>;
    "
  `)
})
