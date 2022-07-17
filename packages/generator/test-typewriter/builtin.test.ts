import generateFixture from './generateFixture'

test('builtin', async () => {
  expect((await generateFixture('builtin', ['A'])).getText()).toMatchSnapshot()
})
