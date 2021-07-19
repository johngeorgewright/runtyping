import { tryCatch } from '@johngw/error'
import {
  EnumDeclaration,
  InterfaceDeclaration,
  Project,
  SourceFile,
  SymbolFlags,
  SyntaxKind,
  Type,
  TypeAliasDeclaration,
  VariableDeclarationKind,
} from 'ts-morph'

const Write = Symbol('Write')
const Import = Symbol('Import')
const ImportFromSource = Symbol('ImportFromSource')
const Declare = Symbol('Declare')

export type RuntypeGenerator = Generator<
  | [typeof Import, string]
  | [typeof ImportFromSource, string]
  | [typeof Write, string]
  | [typeof Declare, string],
  any,
  undefined | boolean
>

export default function writeRuntype(
  project: Project,
  sourceFile: SourceFile,
  sourceType: string,
  targetFile: SourceFile,
  runtypeImports: Set<string>,
  sourceImports: Set<string>,
  exports: Set<string>
) {
  const typeDeclaration = getTypeDeclaration(sourceFile, sourceType)
  const recursive = isRecursive(typeDeclaration)
  const generator = generate(typeDeclaration.getType(), recursive)

  let writer = project.createWriter()
  let item = generator.next()

  while (!item.done) {
    let next: true | undefined

    switch (item.value[0]) {
      case Write:
        writer = writer.write(item.value[1])
        break

      case Import:
        runtypeImports.add(item.value[1])
        break

      case ImportFromSource:
        sourceImports.add(item.value[1])
        break

      case Declare:
        if (recursive || hasTypeDeclaration(sourceFile, item.value[1])) {
          next = true
          writer = writer.write(item.value[1])
        }
        if (next && !recursive && !exports.has(item.value[1]))
          writeRuntype(
            project,
            sourceFile,
            item.value[1],
            targetFile,
            runtypeImports,
            sourceImports,
            exports
          )
        break
    }

    item = generator.next(next)
  }

  targetFile.addVariableStatement({
    isExported: true,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: sourceType,
        initializer: writer.toString(),
      },
    ],
  })

  runtypeImports.add('Static')

  targetFile.addTypeAlias({
    isExported: true,
    name: sourceType,
    type: `Static<typeof ${sourceType}>`,
  })

  exports.add(sourceType)
}

function getTypeDeclaration(sourceFile: SourceFile, sourceType: string) {
  try {
    return sourceFile.getInterfaceOrThrow(sourceType)
  } catch (error) {}

  try {
    return sourceFile.getTypeAliasOrThrow(sourceType)
  } catch (error) {}

  try {
    return sourceFile.getEnumOrThrow(sourceType)
  } catch (error) {
    throw new Error(
      `Cannot find any interface, type or enum called "${sourceType}" in ${sourceFile.getFilePath()}.`
    )
  }
}

function hasTypeDeclaration(sourceFile: SourceFile, sourceType: string) {
  try {
    return !!getTypeDeclaration(sourceFile, sourceType)
  } catch (error) {
    return false
  }
}

function isRecursive(
  typeDeclaration: InterfaceDeclaration | TypeAliasDeclaration | EnumDeclaration
) {
  const name = typeDeclaration.getName()

  for (const node of typeDeclaration.getDescendantsOfKind(
    SyntaxKind.TypeReference
  )) {
    if (node.getText() === name) return true
  }

  return false
}

function* generate(type: Type, isRecursive = false): RuntypeGenerator {
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

  yield* generate(type)
}

function* generateEnumType(type: Type): RuntypeGenerator {
  const name = type.getSymbolOrThrow().getName()
  yield [Import, 'Guard']
  yield [ImportFromSource, name]
  yield [
    Write,
    `Guard((x: any): x is _${name} => Object.values(_${name}).includes(x))`,
  ]
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
