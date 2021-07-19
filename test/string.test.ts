import generateFixture from './generateFixture'

test('strings', () => {
  expect(generateFixture('string', ['A']).getText()).toMatchInlineSnapshot(`
"import { String, Static } from 'runtypes';

export const A = String;

export type A = Static<typeof A>;
"
`)
})
