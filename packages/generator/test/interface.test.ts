import generateFixture from './generateFixture'

test('interface', async () => {
  expect((await generateFixture('interface', ['B', 'C'])).getText())
    .toMatchInlineSnapshot(`
    "import { foo as _foo, boo as _boo } from './interface';
    import { Record, String, Number, Boolean, Static, Literal, Contract, Void } from 'runtypes';

    export const A = Record({ foo: String, bar: Number, [\`has spaces\`]: Boolean, [\`+1\`]: Boolean, [\`-1\`]: Boolean, __underscores__: Boolean, $dollar: Boolean, [\`\\\\\${escaped template vars}\`]: Boolean, });

    export type A = Static<typeof A>;

    export const B = Record({ a: A, b: Literal(\\"B\\"), });

    export type B = Static<typeof B>;

    export const C = Record({ foo: Contract(String), bar: Number, boo: Contract(String, Void), });

    export type C = _boo;
    "
  `)
})
