import { SyntaxKind, Type } from 'ts-morph'

export function getEnumIdentifierNameFromEnumLiteral(enumLiteral: Type) {
  return enumLiteral
    .getSymbolOrThrow()
    .getValueDeclarationOrThrow()
    .getFirstAncestorByKindOrThrow(SyntaxKind.EnumDeclaration)
    .getFirstChildByKindOrThrow(SyntaxKind.Identifier)
    .getText()
}

/**
 * Hack to get around broken `EnumDeclaration.getMemebers()`
 */
export function getEnumMembers(enumType: Type) {
  return enumType
    .getSymbolOrThrow()
    .getValueDeclarationOrThrow()
    .getDescendantsOfKind(SyntaxKind.EnumMember)
    .map((declaration) => declaration.getType())
}
