import generateFixture from './generateFixture'

test('tuple', async () => {
  expect(
    (await generateFixture('tuple', ['A', 'B'])).getText()
  ).toMatchSnapshot()
})
