import generateFixture from './generateFixture'

test('import', async () => {
  expect((await generateFixture('import.a', ['A'])).getText()).toMatchSnapshot()
})
