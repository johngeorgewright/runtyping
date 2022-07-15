import { Type } from 'ts-morph'
import factory from '@runtyping/runtypes/src/typeWriter/factory'
import { DeclareAndUse, TypeWriter } from '@runtyping/generator/dist/TypeWriter'
import enumMemberTypeWriter from '@runtyping/runtypes/src/typeWriter/enumMember'

export default function* generateOrReuseType(type: Type): TypeWriter {
  const typeName =
    type.getAliasSymbol()?.getName() || type.getSymbol()?.getName()

  if (!!typeName) {
    if (type.isEnumLiteral()) return yield* enumMemberTypeWriter(type, typeName)
    else if (yield [DeclareAndUse, typeName]) return
  }

  yield* factory(type)
}
