import generateFixture from './generateFixture'

test('optional property', async () => {
  expect((await generateFixture('optional', ['A'])).getText()).toMatchSnapshot()
})
