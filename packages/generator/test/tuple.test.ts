import { beforeEach, describe, expect, test } from 'vitest'
import { Project, SourceFile, SyntaxKind } from 'ts-morph'
import { getTupleElements, isVariadicTuple } from '../src/tuple'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let project: Project
let sourceFile: SourceFile

beforeEach(() => {
  project = new Project()
  sourceFile = project.addSourceFileAtPath(
    join(__dirname, 'fixtures', 'tuple.ts'),
  )
})

describe('isTupleVariadic()', () => {
  test('with type alias', () => {
    const type = sourceFile.getTypeAlias('Variadic')!.getType()
    expect(isVariadicTuple(type)).toBe(true)
  })

  test('within interface', () => {
    const type = sourceFile
      .getInterface('Test')
      ?.getFirstDescendantByKind(SyntaxKind.TupleType)
      ?.getType()
    expect(isVariadicTuple(type!)).toBe(true)
  })
})

test('getTupleElements()', () => {
  const type = sourceFile.getTypeAlias('Variadic')!.getType()
  expect(getTupleElements(type)).toHaveLength(3)
  expect(getTupleElements(type)[0]).toHaveProperty('variadic', false)
  expect(getTupleElements(type)[1]).toHaveProperty('variadic', true)
  expect(getTupleElements(type)[2]).toHaveProperty('variadic', false)
})
