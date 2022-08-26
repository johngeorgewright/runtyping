import { Node, SyntaxKind, Type } from 'ts-morph'
import { getTypeName } from './util'

export function isArray(type: Type): boolean {
  return type.isArray()
    ? true
    : type.isObject() || type.isInterface()
    ? !!type.getSymbol()?.getDeclarations().some(getArrayInhertianceElementType)
    : false
}

export function getArrayElementType(type: Type) {
  if (type.isArray()) return type.getArrayElementType()
  if (type.isObject() || type.isInterface())
    for (const declaration of type.getSymbol()?.getDeclarations() || []) {
      const element = getArrayInhertianceElementType(declaration)
      if (element) return element
    }
  throw new Error(`Cannot find Array element for ${getTypeName(type)}`)
}

function getArrayInhertianceElementType(declaration: Node): Type | false {
  return (
    declaration
      .getFirstDescendantByKind(SyntaxKind.HeritageClause)
      ?.getFirstDescendantByKind(SyntaxKind.ExpressionWithTypeArguments)
      ?.getType()
      ?.getArrayElementType() || false
  )
}
