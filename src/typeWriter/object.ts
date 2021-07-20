import { SymbolFlags, Type } from 'ts-morph'
import generateOrReuseType from './generateOrReuseType'
import RuntypeGenerator from './RuntypeGenerator'
import { Import, Write } from './symbols'

export default function* objectTypeGenerator(type: Type): RuntypeGenerator {
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
    yield* generateOrReuseType(property.getValueDeclarationOrThrow().getType())
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
  yield* generateOrReuseType(type.getStringIndexType()!)
  yield [Write, ', String)']
}

function* generateNumberIndexType(type: Type): RuntypeGenerator {
  yield [Import, 'Dictionary']
  yield [Import, 'Number']
  yield [Write, 'Dictionary(']
  yield* generateOrReuseType(type.getNumberIndexType()!)
  yield [Write, ', Number)']
}
