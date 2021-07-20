import { tryCatch } from '@johngw/error'
import { Type } from 'ts-morph'
import typeGenerator from './typeGenerator'
import RuntypeGenerator from './RuntypeGenerator'
import { Declare } from './symbols'

export default function* generateOrReuseType(type: Type): RuntypeGenerator {
  const typeName = tryCatch(
    () => type.getSymbolOrThrow().getName(),
    () => null
  )

  if (!!typeName && (yield [Declare, typeName])) {
    return
  }

  yield* typeGenerator(type)
}
