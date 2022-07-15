import generateFixture from './generateFixture'

test('duplicate references', async () => {
  expect(
    (
      await generateFixture('duplicate-references', ['HorseType', 'FooType'])
    ).getText()
  ).toMatchSnapshot()
})
