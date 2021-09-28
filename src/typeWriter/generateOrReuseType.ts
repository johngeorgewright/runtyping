import { Type } from 'ts-morph'
import factory from './factory'
import TypeWriter from './TypeWriter'
import { Declare } from './symbols'

export default function* generateOrReuseType(type: Type): TypeWriter {
  const typeName =
    type.getAliasSymbol()?.getName() || type.getSymbol()?.getName()

  if (!!typeName && (yield [Declare, typeName])) return

  yield* factory(type)
}
