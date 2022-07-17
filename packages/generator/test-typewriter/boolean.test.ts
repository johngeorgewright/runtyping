import generateFixture from './generateFixture'

test('boolean', async () => {
  expect((await generateFixture('boolean', ['A'])).getText()).toMatchSnapshot()
})
