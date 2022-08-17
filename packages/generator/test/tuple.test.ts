import { Project, SourceFile, SyntaxKind } from 'ts-morph'
import { isVariadicTuple } from '../src/tuple'

let project: Project
let sourceFile: SourceFile

beforeEach(() => {
  project = new Project()
  sourceFile = project.addSourceFileAtPath(`${__dirname}/fixtures/tuple.ts`)
})

test('isVariadicTuple', () => {
  const type = sourceFile.getTypeAlias('Variadic')!.getType()
  expect(isVariadicTuple(type)).toBe(true)
})

test('isVariadicTuple within interface', () => {
  const type = sourceFile
    .getInterface('Test')
    ?.getFirstDescendantByKind(SyntaxKind.TupleType)
    ?.getType()
  expect(isVariadicTuple(type!)).toBe(true)
})
