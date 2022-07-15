import generateFixture from './generateFixture'

test('unknown', async () => {
  expect((await generateFixture('unknown', ['A', 'B'])).getText())
})
