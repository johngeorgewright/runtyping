import generateFixture from './generateFixture'

test('namespace', async () => {
  expect(
    (
      await generateFixture('namespace', ['A.B', 'B.C.D', 'A.C', 'A.D'])
    ).getText()
  ).toMatchSnapshot()
})
