import generateFixture from './generateFixture'

test('dont generate static types', async () => {
  expect(
    (
      await generateFixture('without-static-types', ['Three'], {
        exportStaticType: false,
      })
    ).getText()
  ).toMatchInlineSnapshot(`
    "import { Record, Literal, String, Number } from 'runtypes';

    export const One = Record({ type: Literal(\\"one\\"), value: String, });
    export const Two = Record({ type: Literal(\\"two\\"), value: Number, });
    export const Three = One.Or(Two);
    "
  `)
})
