import generateFixture from './generateFixture'

test('intersection', async () => {
  expect(
    (await generateFixture('intersection', ['C'])).getText()
  ).toMatchSnapshot()
})
