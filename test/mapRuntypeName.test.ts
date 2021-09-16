import generateFixture from './generateFixture'

test('mapRuntypeName', async () => {
  const actual = (
    await generateFixture('mapRuntypeName', ['B'], undefined, {
      mapRuntypeName: (name) => `Mapped${name}`,
    })
  ).getText()

  expect(actual).toMatchInlineSnapshot(`
"import { Record, String, Static, Array } from 'runtypes';

export const MappedA = Record({ foo: String, });

export type A = Static<typeof MappedA>;

export const MappedB = Record({ bar: MappedA, baz: MappedA, nest: Record({ baz2: Array(MappedA), }), });

export type B = Static<typeof MappedB>;
"
`)
})
