import { SyntaxKind, Type } from 'ts-morph'

export function getFunctionName(type: Type) {
  const symbol = type.getAliasSymbol() || type.getSymbolOrThrow()
  const firstDeclaration = symbol.getDeclarations()[0]
  return firstDeclaration.isKind(SyntaxKind.ArrowFunction)
    ? firstDeclaration
        .getFirstAncestorByKind(SyntaxKind.VariableDeclaration)
        ?.getFirstChildByKind(SyntaxKind.Identifier)
        ?.getText()
    : symbol.getName()
}
