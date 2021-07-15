import generateFixture from './generateFixture'

test.skip('enum', () => {
  expect(
    generateFixture('enum', ['A', 'B']).getStructure()
  ).toMatchInlineSnapshot()
})
