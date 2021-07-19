import generateFixture from './generateFixture'

test('boolean', () => {
  expect(generateFixture('boolean', ['A']).getText()).toMatchInlineSnapshot(`
"import { Boolean, Static } from 'runtypes';

export const A = Boolean;

export type A = Static<typeof A>;
"
`)
})
