import { Type } from 'ts-morph'
import { Import, ImportFromSource, Write } from './symbols'
import TypeWriter from './TypeWriter'

export default function* enumReferenceTypeGenerator(
  enumMemberType: Type,
  enumMemberTypeName: string
): TypeWriter {
  const enumType = enumMemberType
    .getSymbol()
    ?.getDeclarations()[0]
    .getParent()
    ?.getType()

  if (!enumType) return

  const enumTypeName =
    enumType.getAliasSymbol()?.getName() || enumType.getSymbol()?.getName()

  if (enumTypeName) {
    yield [Import, 'Literal']
    yield [ImportFromSource, { name: enumTypeName, alias: `_${enumTypeName}` }]
    yield [Write, `Literal(_${enumTypeName}.${enumMemberTypeName})`]
  }
}
