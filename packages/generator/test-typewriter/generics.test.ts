import generateFixture from './generateFixture'

test('generics', async () => {
  expect(
    (await generateFixture('generics', ['A', 'B', 'C', 'D', 'F'])).getText()
  ).toMatchSnapshot()
})
