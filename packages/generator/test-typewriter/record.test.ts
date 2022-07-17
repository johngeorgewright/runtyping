import generateFixture from './generateFixture'

test('record', async () => {
  expect((await generateFixture('record', ['A'])).getText()).toMatchSnapshot()
})
