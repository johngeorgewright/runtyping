import generateFixture from './generateFixture'

test('mapRuntypeName', async () => {
  const actual = (
    await generateFixture('typeNameFormat', ['B'], {
      generatorOpts: {
        runtypeFormat: `Mapped{type}Foo`,
        typeFormat: `Mapped{type}Bar`,
      },
    })
  ).getText()

  expect(actual).toMatchSnapshot()
})

test('incorrect formatting', async () => {
  await expect(() =>
    generateFixture('typeNameFormat', ['B'], {
      generatorOpts: {
        runtypeFormat: 'notypeparam',
      },
    })
  ).rejects.toThrow(
    `Type format must contain placeholder '{type}'. Got: "notypeparam".`
  )
})
