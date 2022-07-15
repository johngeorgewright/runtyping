import generateFixture from './generateFixture'

test('dont generate static types', async () => {
  expect(
    (
      await generateFixture('without-static-types', ['Three'], {
        exportStaticType: false,
      })
    ).getText()
  ).toMatchSnapshot()
})
