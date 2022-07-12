import generateFixture from './generateFixture'

test.skip('circular references', async () => {
  expect(
    (await generateFixture('circular-references', ['User'])).getText()
  ).toMatchInlineSnapshot()
})
