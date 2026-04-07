import { existsSync, readFileSync } from 'fs'
import { basename, dirname, extname, join, relative } from 'path'
import { Type } from 'ts-morph'

export function last<T>(array: T[]): T {
  return array[array.length - 1]
}

export function find<T, O>(
  array: T[],
  fn: (item: T) => O | false,
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

export function resolveVirtualPath(virtualPath: string): string {
  const match = /^(.*?)\/__virtual__\/[^/]+\/(\d+)\/(.*)$/.exec(virtualPath)
  if (!match) return virtualPath
  const [, prefix, depthStr, rest] = match
  const depth = parseInt(depthStr, 10)
  let base = prefix
  for (let i = 0; i < depth; i++) {
    base = dirname(base)
  }
  return join(base, rest)
}

export function findPackageRoot(
  filePath: string,
): { name: string; dir: string } | undefined {
  let dir = dirname(filePath)
  while (dir !== dirname(dir)) {
    const pkgJsonPath = join(dir, 'package.json')
    if (existsSync(pkgJsonPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))
        if (pkg.name) return { name: pkg.name, dir }
      } catch {
        // invalid package.json, skip
      }
      break
    }
    dir = dirname(dir)
  }
  return undefined
}

export function getRelativeImportPath(localPath: string, remotePath: string) {
  if (remotePath.includes('/__virtual__/')) {
    const realPath = resolveVirtualPath(remotePath)
    const remotePkg = findPackageRoot(realPath)
    if (remotePkg) {
      const localPkg = findPackageRoot(localPath)
      if (localPkg?.dir !== remotePkg.dir) {
        const relPath = relative(remotePkg.dir, realPath).replace(
          /(\.d)?\.ts$/,
          '',
        )
        return relPath ? `${remotePkg.name}/${relPath}` : remotePkg.name
      }
      remotePath = realPath
    } else {
      remotePath = realPath
    }
  }

  if (remotePath.includes('/node_modules/')) {
    const nodeModulePath = remotePath
      .slice(remotePath.lastIndexOf('/node_modules/') + '/node_modules/'.length)
      .replace(/(\.d)?\.ts$/, '')
    return nodeModulePath.startsWith('@types/')
      ? nodeModulePath.replace('@types/', '').replace('__', '/')
      : nodeModulePath
  }
  if (!/^(\/|\.|[A-Z]:)/.test(remotePath)) return remotePath
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
