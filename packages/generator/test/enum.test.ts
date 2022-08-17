import { Project } from 'ts-morph'
import { getEnumIdentifierNameFromEnumLiteral } from '../src/enum'

let project: Project

beforeEach(() => {
  project = new Project()
})

test('getEnumIdentifierNameFromEnumLiteral', () => {
  const sourceFile = project.addSourceFileAtPath(
    `${__dirname}/fixtures/enum.ts`
  )
  const type = sourceFile.getTypeAlias('TestLiteral')?.getType()
  expect(getEnumIdentifierNameFromEnumLiteral(type!)).toBe('TestEnum')
})
