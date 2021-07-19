import { tryCatch } from '@johngw/error'
import { SymbolFlags, Type } from 'ts-morph'

export const Write = Symbol('Write')
export const Import = Symbol('Import')
export const Declare = Symbol('Declare')

export type RuntypeGenerator = Generator<
  [typeof Import, string] | [typeof Write, string] | [typeof Declare, string],
  any,
  undefined | boolean
>

export default function* runtypeGenerator(
  type: Type,
  isRecursive = false
): RuntypeGenerator {
  if (isRecursive) {
    yield [Import, 'Lazy']
    yield [Write, 'Lazy(() => ']
  }

  switch (true) {
    case type.isString():
      yield* generateSimpleType('String')
      break

    case type.isNumber():
      yield* generateSimpleType('Number')
      break

    case type.isBoolean():
      yield* generateSimpleType('Boolean')
      break

    case type.isArray():
      yield* generateArrayType(type)
      break

    case type.isEnum():
      yield* generateEnumType(type)
      break

    case type.isIntersection():
      yield* generateIntersectionType(type)
      break

    case type.isUnion():
      yield* generateUnionType(type)
      break

    case type.isLiteral():
      yield [Import, 'Literal']
      yield [Write, `Literal(${type.getText()})`]
      break

    case type.isAny():
      yield* generateSimpleType('Unknown')
      break

    case type.isUndefined():
      yield* generateSimpleType('Undefined')
      break

    case type.isInterface():
    case type.isObject():
      yield* generateObjectType(type)
      break

    default:
      throw new Error('!!! TYPE ' + type.getText() + ' NOT PARSED !!!')
  }

  if (isRecursive) {
    yield [Write, ')']
  }
}

function* generateType(type: Type): RuntypeGenerator {
  const typeName = tryCatch(
    () => type.getSymbolOrThrow().getName(),
    () => null
  )

  if (!!typeName && (yield [Declare, typeName])) {
    return
  }

  yield* runtypeGenerator(type)
}

/**
 * @todo Members is always empty
 */
function* generateEnumType(type: Type): RuntypeGenerator {
  const [first, ...members] = type
    .getSymbolOrThrow()
    .getMembers()
    .map((member) => member.getDeclaredType())

  if (!first) {
    yield* generateSimpleType('Undefined')
    return
  }

  yield* generateType(first)

  for (const member of members) {
    yield [Write, '.Or(']
    yield* generateType(member)
    yield [Write, ')']
  }
}

function* generateSimpleType(type: string): RuntypeGenerator {
  yield [Import, type]
  yield [Write, type]
}

function* generateArrayType(type: Type): RuntypeGenerator {
  yield [Import, 'Array']
  yield [Write, 'Array(']
  yield* generateType(type.getArrayElementTypeOrThrow())
  yield [Write, ')']
}

function* generateObjectType(type: Type): RuntypeGenerator {
  const isBuiltInType = type
    .getSymbolOrThrow()
    .getDeclarations()
    .some((d) =>
      d.getSourceFile().getFilePath().includes(require.resolve('typescript'))
    )

  if (isBuiltInType) {
    yield* generateBuildInType(type)
    return
  }

  if (type.getStringIndexType()) {
    yield* generateStringIndexType(type)
    return
  } else if (type.getNumberIndexType()) {
    yield* generateNumberIndexType(type)
    return
  }

  yield [Import, 'Record']
  yield [Write, 'Record({']

  for (const property of type.getProperties()) {
    yield [Write, `${property.getName()}:`]
    yield* generateType(property.getValueDeclarationOrThrow().getType())
    if (property.hasFlags(SymbolFlags.Optional)) yield [Write, '.optional()']
    yield [Write, ',']
  }

  yield [Write, '})']
}

function* generateBuildInType(type: Type): RuntypeGenerator {
  yield [Import, 'InstanceOf']
  yield [Write, `InstanceOf(${type.getText()})`]
}

function* generateStringIndexType(type: Type): RuntypeGenerator {
  yield [Import, 'Dictionary']
  yield [Import, 'String']
  yield [Write, 'Dictionary(']
  yield* generateType(type.getStringIndexType()!)
  yield [Write, ', String)']
}

function* generateNumberIndexType(type: Type): RuntypeGenerator {
  yield [Import, 'Dictionary']
  yield [Import, 'Number']
  yield [Write, 'Dictionary(']
  yield* generateType(type.getNumberIndexType()!)
  yield [Write, ', Number)']
}

function* generateIntersectionType(type: Type): RuntypeGenerator {
  const [first, ...rest] = type.getIntersectionTypes().sort(sortUndefinedFirst)

  if (!first) {
    yield* generateSimpleType('Undefined')
    return
  }

  yield* generateType(first)
  for (const item of rest) {
    yield [Write, '.And(']
    yield* generateType(item)
    yield [Write, ')']
  }
}

function* generateUnionType(type: Type): RuntypeGenerator {
  const [first, ...rest] = type.getUnionTypes().sort(sortUndefinedFirst)

  if (!first) {
    yield* generateSimpleType('Undefined')
    return
  }

  yield* generateType(first)
  for (const item of rest) {
    yield [Write, '.Or(']
    yield* generateType(item)
    yield [Write, ')']
  }
}

function sortUndefinedFirst(a: Type, b: Type) {
  return (
    Number(a.isUndefined()) - Number(b.isUndefined()) || +(a > b) || -(a < b)
  )
}
