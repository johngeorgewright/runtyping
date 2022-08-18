import { SyntaxKind, Type } from 'ts-morph'

/**
 * Determins whether a tuple is variadic.
 */
export function isVariadicTuple(type: Type) {
  const syntaxList = getTupleSyntaxList(type)
  return syntaxList
    ? !!syntaxList?.getFirstChildByKind(SyntaxKind.RestType)
    : type.getText().startsWith('[') && type.getText().endsWith(']')
    ? type.getText().includes(', ...')
    : false
}

/**
 * Gets a unique set of types in the tuple
 */
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

/**
 * Returns a list of tuple types. This differs from type.getTupleElements()
 * in that it signifies in a type is variadic.
 *
 * @example
 * // tuple = [string, number, ...string]
 * getTupleTypeList(tuple)
 * // [{element}, {element}, {element, variadic}}]
 */
export function getTupleElements(type: Type) {
  const variadicIndex = getTupleVariadicIndex(type)
  return type
    .getTupleElements()
    .map((element, i) => new TupleElement(element, i === variadicIndex))
}

/**
 * Returns the minimum size the tuple can be.
 * Useful for variadic tuples.
 */
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
        .filter((x) => !x.trim().startsWith('...')).length
    : undefined
}

class TupleElement {
  constructor(
    public readonly element: Type,
    public readonly variadic: boolean
  ) {}
}

function getTupleVariadicIndex(type: Type) {
  const syntaxList = getTupleSyntaxList(type)
  return syntaxList
    ? syntaxList
        ?.getChildren()
        .filter((child) => child.getKind() !== SyntaxKind.CommaToken)
        .findIndex((child) => child.getKind() === SyntaxKind.RestType)
    : type.getText().startsWith('[') && type.getText().endsWith(']')
    ? type
        .getText()
        .split(',')
        .findIndex((x) => x.trim().startsWith('...'))
    : -1
}

function getTupleSyntaxList(type: Type) {
  return (type.getAliasSymbol() || type.getSymbol())
    ?.getDeclarations()[0]
    .getFirstChildByKind(SyntaxKind.TupleType)
    ?.getFirstChildByKind(SyntaxKind.SyntaxList)
}
