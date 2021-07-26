import { Type } from 'ts-morph'
import { last } from '../util'
import generateOrReuseType from './generateOrReuseType'
import RuntypeGenerator from './RuntypeGenerator'
import { Import, Write } from './symbols'

export default function* functionTypeGenerator(type: Type): RuntypeGenerator {
  const signature = last(type.getCallSignatures())
  yield [Import, 'Contract']
  yield [Write, 'Contract(']
  for (const param of signature.getParameters()) {
    yield* generateOrReuseType(last(param.getDeclarations()).getType())
    yield [Write, ',']
  }
  yield* generateOrReuseType(signature.getReturnType())
  yield [Write, ')']
}
