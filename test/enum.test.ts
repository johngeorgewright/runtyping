import generateFixture from './generateFixture'

test.skip('enum', async () => {
  expect(
    (await generateFixture('enum', ['A', 'B'])).getText()
  ).toMatchInlineSnapshot()
})
