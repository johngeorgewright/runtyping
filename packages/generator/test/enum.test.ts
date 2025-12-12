import { beforeEach, expect, test } from 'vitest'
import { Project } from 'ts-morph'
import { getEnumIdentifierNameFromEnumLiteral } from '../src/enum'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let project: Project

beforeEach(() => {
  project = new Project()
})

test('getEnumIdentifierNameFromEnumLiteral', () => {
  const sourceFile = project.addSourceFileAtPath(
    join(__dirname, 'fixtures', 'enum.ts'),
  )
  const type = sourceFile.getTypeAlias('TestLiteral')?.getType()
  expect(getEnumIdentifierNameFromEnumLiteral(type!)).toBe('TestEnum')
})
