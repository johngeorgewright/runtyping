import generateFixture from './generateFixture'

test('strings', async () => {
  expect((await generateFixture('string', ['A'])).getText()).toMatchSnapshot()
})
