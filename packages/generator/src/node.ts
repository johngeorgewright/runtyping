import {
  EnumDeclaration,
  FunctionDeclaration,
  InterfaceDeclaration,
  Node,
  StatementedNode,
  SyntaxKind,
  ts,
  TypeAliasDeclaration,
  VariableDeclaration,
} from 'ts-morph'
import { find } from './util'

export function doInModule<
  T extends (node: StatementedNode, name: string) => any
>(root: StatementedNode, name: string, fn: T): ReturnType<T> {
  const nameParts = name.split('.')
  const targetNode = nameParts
    .slice(0, -1)
    .reduce(
      (a, x) => a.getModule(x) ?? a.addModule({ name: x, isExported: true }),
      root
    )
  return fn(
    targetNode,
    nameParts.reduceRight((x) => x)
  )
}

export function findInModule<
  T extends (node: StatementedNode, name: string) => any
>(root: StatementedNode, name: string, fn: T): ReturnType<T> | undefined {
  const findInModuleInner = (
    node: StatementedNode,
    nameParts: string[]
  ): ReturnType<T> | undefined => {
    if (nameParts.length === 0) return undefined
    if (nameParts.length === 1) return fn(node, nameParts[0])
    for (const child of node
      .getModules()
      .filter((x) => x.getName() === nameParts[0])) {
      const out = findInModuleInner(child, nameParts.slice(1))
      if (out !== undefined) return out
    }
    return undefined
  }
  return findInModuleInner(root, name.split('.'))
}

export function isRecursive(typeDeclaration: ConsideredTypeDeclaration) {
  const name = typeDeclaration.getName()
  return !!name && findReferenceWithinDeclaration(name, typeDeclaration)
}

export function isConsideredType(
  node: Node
): node is ConsideredTypeDeclaration {
  return ConsideredTypeDeclarationSyntaxKinds.some((kind) => node.isKind(kind))
}

export function validateConsideredType(node: Node): ConsideredTypeDeclaration {
  if (!isConsideredType(node))
    throw new Error(`${node.getText()} is not a considered type`)
  return node
}

function findReferenceWithinDeclaration(
  name: string,
  typeDeclaration: ConsideredTypeDeclaration
) {
  for (const node of typeDeclaration.getDescendantsOfKind(
    SyntaxKind.TypeReference
  ))
    if (node.getText() === name) return true
  return false
}

export function isCircular(typeDeclaration: ConsideredTypeDeclaration) {
  const name = typeDeclaration.getName()
  if (!name) return false

  for (const originalReference of typeDeclaration.findReferences()) {
    for (const reference of originalReference.getReferences()) {
      const declarationNode = getNodeDeclaration(reference.getNode())
      if (declarationNode) {
        const declarationName = getNodeIdentifier(declarationNode)
        if (
          declarationName &&
          declarationName !== name &&
          findReferenceWithinDeclaration(
            name,
            declarationNode as ConsideredTypeDeclaration
          ) &&
          findReferenceWithinDeclaration(declarationName, typeDeclaration)
        ) {
          return [declarationName, name]
        }
      }
    }
  }

  return false
}

function getNodeDeclaration(node: Node<ts.Node>) {
  return find(
    ConsideredTypeDeclarationSyntaxKinds,
    (syntaxKind) => node.getFirstAncestorByKind(syntaxKind) || false
  )
}

function getNodeIdentifier(node: Node<ts.Node>) {
  return node.getFirstChildByKind(SyntaxKind.Identifier)?.getText()
}

export const ConsideredTypeDeclarationSyntaxKinds = [
  SyntaxKind.InterfaceDeclaration,
  SyntaxKind.TypeAliasDeclaration,
  SyntaxKind.EnumDeclaration,
  SyntaxKind.FunctionDeclaration,
  SyntaxKind.VariableDeclaration,
]

export type ConsideredTypeDeclaration =
  | InterfaceDeclaration
  | TypeAliasDeclaration
  | EnumDeclaration
  | FunctionDeclaration
  | VariableDeclaration
