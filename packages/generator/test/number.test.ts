import generateFixture from './generateFixture'

test('numbers', async () => {
  expect((await generateFixture('number', ['A'])).getText()).toMatchSnapshot()
})
