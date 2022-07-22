import { SyntaxKind, Type } from 'ts-morph'

export function getEnumIdentifierNameFromEnumLiteral(enumLiteral: Type) {
  return enumLiteral
    .getSymbolOrThrow()
    .getValueDeclarationOrThrow()
    .getFirstAncestorByKindOrThrow(SyntaxKind.EnumDeclaration)
    .getFirstChildByKindOrThrow(SyntaxKind.Identifier)
    .getText()
}
