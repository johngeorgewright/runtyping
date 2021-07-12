import tsModule from './runtypes-generator'

test("it's a module", () => {
  expect(tsModule()).toBe('I am a TypeScript module')
})
