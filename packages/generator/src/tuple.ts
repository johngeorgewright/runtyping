import { SyntaxKind, Type } from 'ts-morph'

export function isVariadicTuple(type: Type) {
  const syntaxList = getTupleSyntaxList(type)
  return syntaxList
    ? !!syntaxList?.getFirstChildByKind(SyntaxKind.RestType)
    : type.getText().startsWith('[') && type.getText().endsWith(']')
    ? type.getText().includes(', ...')
    : false
}

export function getTupleElementTypes(type: Type) {
  const [, types] = type.getTupleElements().reduce(
    ([texts, types], element) =>
      texts.includes(element.getText())
        ? [texts, types]
        : [
            [...texts, element.getText()],
            [...types, element],
          ],
    [[], []] as [string[], Type[]]
  )
  return types
}

export function getTupleMinSize(type: Type) {
  const syntaxList = getTupleSyntaxList(type)
  return syntaxList
    ? syntaxList
        ?.getChildren()
        .filter(
          (child) =>
            child.getKind() !== SyntaxKind.RestType &&
            child.getKind() !== SyntaxKind.CommaToken
        ).length
    : type.getText().startsWith('[') && type.getText().endsWith(']')
    ? type
        .getText()
        .split(',')
        .map((x) => x.trim())
        .filter((x) => !x.startsWith('...')).length
    : undefined
}

function getTupleSyntaxList(type: Type) {
  return (type.getAliasSymbol() || type.getSymbol())
    ?.getDeclarations()[0]
    .getFirstChildByKind(SyntaxKind.TupleType)
    ?.getFirstChildByKind(SyntaxKind.SyntaxList)
}
