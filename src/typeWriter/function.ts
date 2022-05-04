import { FunctionDeclaration, Node, Signature, Type } from 'ts-morph'
import { last } from '../util'
import generateOrReuseType from './generateOrReuseType'
import TypeWriter from './TypeWriter'
import { Import, ImportFromSource, Static, Write } from './symbols'

export default function* functionTypeWriter(
  type: Type,
  name?: string
): TypeWriter {
  const signature = last(type.getCallSignatures())
  name =
    name ||
    type.getAliasSymbol()?.getName() ||
    type.getSymbolOrThrow().getName()

  const contract = isAsync(signature) ? 'AsyncContract' : 'Contract'
  const importAlias = `_${name}`

  yield [ImportFromSource, { name, alias: importAlias }]
  yield [Import, contract]
  yield [Write, `${contract}(`]

  for (const param of signature.getParameters()) {
    const paramDec = last(param.getDeclarations())
    yield* generateOrReuseType(paramDec.getType())
    if (!paramDec.getType().isNullable() && isOptionalParam(paramDec))
      yield [Write, '.optional()']
    yield [Write, ',']
  }

  yield* generateOrReuseType(
    isAsync(signature)
      ? signature.getReturnType().getTypeArguments()[0]
      : signature.getReturnType()
  )

  yield [Write, ')']

  if (isFunctionDeclaration(type)) {
    yield [Write, `.enforce(${importAlias})`]
    yield [Static, `typeof ${name}`]
  } else yield [Static, importAlias]
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
