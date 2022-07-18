import {
  FunctionDeclaration,
  Node,
  Signature,
  SyntaxKind,
  Type,
} from 'ts-morph'
import {
  getTypeName,
  Import,
  ImportFromSource,
  last,
  Static,
  TypeWriter,
  TypeWriterFactory,
  Write,
} from '@runtyping/generator'

export default function* functionTypeWriter(
  type: Type,
  factory: TypeWriterFactory
): TypeWriter {
  const signature = last(type.getCallSignatures())
  const name = getName(type)

  const contract = isAsync(signature) ? 'AsyncContract' : 'Contract'
  const importAlias = `_${name}`

  yield [ImportFromSource, { name, alias: importAlias }]
  yield [Import, contract]
  yield [Write, `${contract}(`]

  for (const param of signature.getParameters()) {
    const paramDec = last(param.getDeclarations())
    yield* factory.generateOrReuseType(paramDec.getType())
    if (!paramDec.getType().isNullable() && isOptionalParam(paramDec))
      yield [Write, '.optional()']
    yield [Write, ',']
  }

  yield* factory.generateOrReuseType(
    isAsync(signature)
      ? signature.getReturnType().getTypeArguments()[0]
      : signature.getReturnType()
  )

  yield [Write, ')']

  if (isFunctionDeclaration(type)) {
    yield [Write, `.enforce(${importAlias})`]
    yield [Static, 'typeof ${name}']
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

function getName(type: Type) {
  if (type.getSymbol()?.getValueDeclaration()?.isKind(SyntaxKind.ArrowFunction))
    for (const sibling of type
      .getSymbol()
      ?.getValueDeclarationOrThrow()
      .getPreviousSiblings() || [])
      if (sibling.isKind(SyntaxKind.Identifier)) return sibling.getText()
  return getTypeName(type)
}
