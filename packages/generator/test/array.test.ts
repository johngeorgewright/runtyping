import generateFixture from './generateFixture'

test('array', async () => {
  expect((await generateFixture('array', ['B'])).getText()).toMatchSnapshot()
})
