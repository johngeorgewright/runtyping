import { CodeBlockWriter, Type } from 'ts-morph'
import { tryCatch } from '@johngw/error'

export const Writer = Symbol('Writer')
export const Import = Symbol('Import')
export const Variable = Symbol('Variable')

export type TypeGenerator = Generator<
  | [typeof Import, string]
  | [typeof Writer, CodeBlockWriter]
  | [typeof Variable, string],
  CodeBlockWriter,
  CodeBlockWriter
>

export default function* generateType(
  writer: CodeBlockWriter,
  type: Type,
  hasTypeDeclaration: (typeName: string) => boolean,
  reuse: boolean = false
): TypeGenerator {
  const typeName = tryCatch(
    () => type.getSymbolOrThrow().getName(),
    () => null
  )
  if (typeName && reuse && hasTypeDeclaration(typeName)) {
    yield [Variable, typeName]
    return yield [Writer, writer.write(typeName)]
  }

  if (type.isArray()) {
    return yield* generateArrayType(writer, type, hasTypeDeclaration)
  }

  if (type.isUnion()) {
    return yield* generateUnionType(writer, type, hasTypeDeclaration)
  }

  if (type.isStringLiteral()) {
    yield [Import, 'Literal']
    return yield [Writer, writer.write(`Literal(${type.getText()})`)]
  }

  if (type.isString()) {
    yield [Import, 'String']
    return yield [Writer, writer.write('String')]
  }

  if (type.isNumber()) {
    yield [Import, 'Number']
    return yield [Writer, writer.write('Number')]
  }

  if (type.isAny()) {
    yield [Import, 'Unknown']
    return yield [Writer, writer.write('Unknown')]
  }

  if (type.isUndefined()) {
    yield [Import, 'Undefined']
    return yield [Writer, writer.write('Undefined')]
  }

  if (type.isInterface() || type.isObject()) {
    return yield* generateObjectType(writer, type, hasTypeDeclaration)
  }

  throw new Error('!!! TYPE ' + type.getText() + ' NOT PARSED !!!')
}

function* generateArrayType(
  writer: CodeBlockWriter,
  type: Type,
  hasTypeDeclaration: (typeName: string) => boolean
): TypeGenerator {
  yield [Import, 'Array']
  writer = yield [Writer, writer.write('Array(')]
  writer = yield* generateType(
    writer,
    type.getArrayElementTypeOrThrow(),
    hasTypeDeclaration,
    true
  )
  return yield [Writer, writer.write(')')]
}

function* generateUnionType(
  writer: CodeBlockWriter,
  type: Type,
  hasTypeDeclaration: (typeName: string) => boolean
): TypeGenerator {
  const [first, ...rest] = type
    .getUnionTypes()
    .sort(
      (a, b) =>
        Number(a.isUndefined()) - Number(b.isUndefined()) ||
        +(a > b) ||
        -(a < b)
    )

  if (!first) {
    yield [Import, 'Undefined']
    return yield [Writer, writer.write('Undefined')]
  }

  writer = yield* generateType(writer, first, hasTypeDeclaration, true)
  for (const item of rest) {
    writer = yield [Writer, writer.write('.Or()')]
    writer = yield* generateType(writer, item, hasTypeDeclaration, true)
    writer = yield [Writer, writer.write(')')]
  }
  return writer
}

function* generateObjectType(
  writer: CodeBlockWriter,
  type: Type,
  hasTypeDeclaration: (typeName: string) => boolean
): TypeGenerator {
  const isBuiltInType = type
    .getSymbolOrThrow()
    .getDeclarations()
    .some((d) =>
      d.getSourceFile().getFilePath().includes(require.resolve('typescript'))
    )

  if (isBuiltInType) {
    yield [Import, 'InstanceOf']
    return yield [Writer, writer.write(`InstanceOf(${type.getText()})`)]
  }

  if (type.getStringIndexType()) {
    yield [Import, 'Dictionary']
    yield [Import, 'String']
    writer = yield [Writer, writer.write('Dictionary(')]
    writer = yield* generateType(
      writer,
      type.getStringIndexType()!,
      hasTypeDeclaration,
      true
    )
    return yield [Writer, writer.write(')')]
  }

  yield [Import, 'Record']
  writer = yield [Writer, writer.write('Record({')]
  for (const property of type.getProperties()) {
    writer = yield [Writer, writer.write(`${property.getName()}:`)]
    writer = yield* generateType(
      writer,
      property.getValueDeclarationOrThrow().getType(),
      hasTypeDeclaration,
      true
    )
    writer = yield [Writer, writer.write(',')]
  }
  return yield [Writer, writer.write('})')]
}
