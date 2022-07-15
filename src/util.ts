import { basename, dirname, extname, relative } from 'path'
import { StatementedNode } from 'ts-morph'

export function last<T>(array: T[]): T {
  return array[array.length - 1]
}

export function find<T, O>(array: T[], fn: (item: T) => O | false): O | void {
  for (const item of array) {
    const result = fn(item)
    if (result !== false) {
      return result
    }
  }
}

export function getRelativeImportPath(localPath: string, remotePath: string) {
  if (!/^(\/|\.)/.test(remotePath)) return remotePath
  const localDir = dirname(localPath)
  const remoteDir = dirname(remotePath)
  if (localDir === '.' && remoteDir.startsWith('./')) return remotePath
  const remoteBasename = basename(remotePath, extname(remotePath))
  const remoteExtname = remotePath.endsWith('.ts') ? '' : extname(remotePath)
  return `${
    relative(localDir, remoteDir) || '.'
  }/${remoteBasename}${remoteExtname}`
}

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

export type PickByValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]-?: T[Key] extends ValueType ? Key : never }[keyof T]
>
