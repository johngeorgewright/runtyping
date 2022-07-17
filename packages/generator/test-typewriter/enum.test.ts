import generateFixture from './generateFixture'

test('enum', async () => {
  expect(
    (await generateFixture('enum', ['A', 'B', 'D'])).getText()
  ).toMatchSnapshot()
})
