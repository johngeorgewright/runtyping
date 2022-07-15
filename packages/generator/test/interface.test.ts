import generateFixture from './generateFixture'

test('interface', async () => {
  expect(
    (await generateFixture('interface', ['B', 'C'])).getText()
  ).toMatchSnapshot()
})
