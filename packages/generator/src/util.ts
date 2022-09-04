import { basename, dirname, extname, relative } from 'path'
import { Type } from 'ts-morph'

export function last<T>(array: T[]): T {
  return array[array.length - 1]
}

export function find<T, O>(
  array: T[],
  fn: (item: T) => O | false
): O | undefined {
  for (const item of array) {
    const result = fn(item)
    if (result !== false) {
      return result
    }
  }
  return
}

export function setHas<T>(set: Set<T>, predicate: (item: T) => boolean) {
  for (const item of set) if (predicate(item)) return true
  return false
}

export function getRelativeImportPath(localPath: string, remotePath: string) {
  if (remotePath.includes('/node_modules/')) {
    const nodeModulePath = remotePath
      .slice(remotePath.lastIndexOf('/node_modules/') + '/node_modules/'.length)
      .replace(/(\.d)?\.ts$/, '')
    return nodeModulePath.startsWith('@types/')
      ? nodeModulePath.replace('@types/', '').replace('__', '/')
      : nodeModulePath
  }
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

export function isRelative(path: string) {
  return /^\.{1,2}\//.test(path)
}

export type PickByValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]-?: T[Key] extends ValueType ? Key : never }[keyof T]
>

export function getTypeName(type: Type) {
  return type.getAliasSymbol()?.getName() || type.getSymbolOrThrow().getName()
}

export function sortUndefinedFirst(a: Type, b: Type) {
  return (
    Number(a.isUndefined()) - Number(b.isUndefined()) || +(a > b) || -(a < b)
  )
}
