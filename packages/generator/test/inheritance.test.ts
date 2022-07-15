import generateFixture from './generateFixture'

test('inheritance', async () => {
  expect(
    (await generateFixture('inheritance', ['C', 'D', 'E'])).getText()
  ).toMatchSnapshot()
})
