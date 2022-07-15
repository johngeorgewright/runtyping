import generateFixture from './generateFixture'

test('union', async () => {
  expect((await generateFixture('union', ['C'])).getText()).toMatchSnapshot()
})
