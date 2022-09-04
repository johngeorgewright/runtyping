import { ts, Type } from 'ts-morph'

export function propNameRequiresQuotes(propName: string) {
  return !/^[\$_[a-zA-Z][\$\w]*$/.test(propName)
}

export function escapeQuottedPropName(propName: string) {
  return propName.replace(/\$/g, '\\$')
}

export function getGenerics(type: Type) {
  const typeArguments = type.getTypeArguments()
  const aliasTypeArguments = type.getAliasTypeArguments()
  return [...typeArguments, ...aliasTypeArguments]
}

export function isBuiltInType(type: Type) {
  return type
    .getSymbolOrThrow()
    .getDeclarations()
    .some((d) => {
      if (d.getSourceFile().compilerNode.hasNoDefaultLib) {
        const name = type.getSymbolOrThrow().getName()
        const parent = d.getParentOrThrow()
        const siblings = (
          [
            ts.SyntaxKind.ClassDeclaration,
            ts.SyntaxKind.FunctionDeclaration,
            ts.SyntaxKind.VariableDeclaration,
          ] as const
        ).flatMap((x) => parent.getChildrenOfKind(x))
        return siblings.some((x) => x.getName() === name)
      }
      return false
    })
}

export function emptyObject<T extends Record<keyof any, unknown>>(obj: T) {
  return !Object.keys(obj).length
}
