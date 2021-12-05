import { SymbolFlags, Type } from 'ts-morph'
import generateOrReuseType from './generateOrReuseType'
import TypeWriter, { DeclaredType } from './TypeWriter'
import { Declare, Import, Write } from './symbols'

export default function* objectTypeGenerator(type: Type): TypeWriter {
  const isBuiltInType = type
    .getSymbolOrThrow()
    .getDeclarations()
    .some((d) =>
      d.getSourceFile().getFilePath().includes(require.resolve('typescript'))
    )

  if (isBuiltInType) return yield* generateBuildInType(type)
  else if (type.getStringIndexType())
    return yield* generateStringIndexType(type)
  else if (type.getNumberIndexType())
    return yield* generateNumberIndexType(type)

  const hasInheritence = yield* generateInheritance(type)

  yield [Import, 'Record']
  yield [Write, 'Record({']

  for (const property of type.getProperties()) {
    yield [Write, `${property.getName()}:`]
    const propertyType = property.getValueDeclarationOrThrow().getType()
    yield* generateOrReuseType(propertyType)
    if (property.hasFlags(SymbolFlags.Optional)) yield [Write, '.optional()']
    yield [Write, ',']
  }

  yield [Write, '})']

  if (hasInheritence) yield [Write, ')']
}

function* generateBuildInType(type: Type): TypeWriter {
  yield [Import, 'InstanceOf']
  yield [Write, `InstanceOf(${type.getText()})`]
}

function* generateStringIndexType(type: Type): TypeWriter {
  yield [Import, 'Dictionary']
  yield [Import, 'String']
  yield [Write, 'Dictionary(']
  yield* generateOrReuseType(type.getStringIndexType()!)
  yield [Write, ', String)']
}

function* generateNumberIndexType(type: Type): TypeWriter {
  yield [Import, 'Dictionary']
  yield [Import, 'Number']
  yield [Write, 'Dictionary(']
  yield* generateOrReuseType(type.getNumberIndexType()!)
  yield [Write, ', Number)']
}

function* generateInheritance(type: Type): TypeWriter<boolean> {
  if (!type.isClassOrInterface()) return false
  const baseTypes = type.getBaseTypes()
  if (!baseTypes.length) return false
  let inheritedTypes: DeclaredType[] = []
  for (const baseType of baseTypes)
    inheritedTypes.push((yield [Declare, baseType.getText()]) as DeclaredType)
  const [first, ...rest] = inheritedTypes
  yield [Write, first.runTypeName]
  for (const inherited of rest) yield [Write, `.And(${inherited.runTypeName})`]
  yield [Write, '.And(']
  return true
}
