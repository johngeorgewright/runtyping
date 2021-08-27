import { FunctionDeclaration, Node, Signature, Type } from 'ts-morph'
import { last } from '../util'
import generateOrReuseType from './generateOrReuseType'
import RuntypeGenerator from './RuntypeGenerator'
import { Import, ImportFromSource, Static, Write } from './symbols'

export default function* functionTypeGenerator(type: Type): RuntypeGenerator {
  const signature = last(type.getCallSignatures())
  const name =
    type.getAliasSymbol()?.getName() || type.getSymbolOrThrow().getName()

  const contract = isAsync(signature) ? 'AsyncContract' : 'Contract'

  yield [ImportFromSource, name]
  yield [Import, contract]
  yield [Write, `${contract}(`]

  for (const param of signature.getParameters()) {
    const paramDec = last(param.getDeclarations())
    yield* generateOrReuseType(paramDec.getType())
    if (isOptionalParam(paramDec)) {
      yield [Write, '.optional()']
    }
    yield [Write, ',']
  }

  yield* generateOrReuseType(
    isAsync(signature)
      ? signature.getReturnType().getTypeArguments()[0]
      : signature.getReturnType()
  )

  yield [Write, ')']

  if (isFunctionDeclaration(type)) {
    yield [Write, `.enforce(_${name})`]
    yield [Static, `typeof ${name}`]
  } else {
    yield [Static, `_${name}`]
  }
}

function isFunctionDeclaration(type: Type) {
  return type
    .getSymbol()
    ?.getDeclarations()
    .some((d) => d instanceof FunctionDeclaration)
}

function isAsync(signature: Signature) {
  return signature.getReturnType().getTargetType()?.getText() === 'Promise<T>'
}

function isOptionalParam(node: Node) {
  return node.getText().includes('?: ')
}
