import { Type } from 'ts-morph'
import factory from './factory'
import RuntypeGenerator from './RuntypeGenerator'
import { Declare } from './symbols'

export default function* generateOrReuseType(type: Type): RuntypeGenerator {
  let typeName = type.getSymbol()?.getName()

  if (typeName === '__type') {
    typeName = type.getText()
  }

  if (!!typeName && (yield [Declare, typeName])) {
    return
  }

  yield* factory(type)
}
