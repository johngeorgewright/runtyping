import generateFixture from './generateFixture'

test('enum', async () => {
  expect((await generateFixture('enum', ['A', 'B'])).getText())
    .toMatchInlineSnapshot(`
    "import { A, B } from './enum';
    import { Guard, Static } from 'runtypes';

    export const A = Guard((x: any): x is A => Object.values(A).includes(x));

    export type A = Static<typeof A>;

    export const B = Guard((x: any): x is B => Object.values(B).includes(x));

    export type B = Static<typeof B>;
    "
  `)
})
