import generateFixture from './generateFixture'

test('literal', async () => {
  expect(
    (await generateFixture('literal', ['A', 'B', 'C'])).getText()
  ).toMatchSnapshot()
})
