import { Type } from 'ts-morph'
import { last } from '../util'
import generateOrReuseType from './generateOrReuseType'
import RuntypeGenerator from './RuntypeGenerator'
import { Import, ImportFromSource, Write } from './symbols'

export default function* functionTypeGenerator(type: Type): RuntypeGenerator {
  const signature = last(type.getCallSignatures())
  const name =
    type.getAliasSymbol()?.getName() || type.getSymbolOrThrow().getName()

  yield [ImportFromSource, name]
  yield [Import, 'Contract']
  yield [Write, 'Contract(']

  for (const param of signature.getParameters()) {
    yield* generateOrReuseType(last(param.getDeclarations()).getType())
    yield [Write, ',']
  }

  yield* generateOrReuseType(signature.getReturnType())

  yield [Write, `).enforce(_${name})`]
}
