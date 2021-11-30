import { basename, dirname, extname, relative } from 'path'

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
  const remoteBasename = basename(remotePath, extname(remotePath))
  const remoteExtname = remotePath.endsWith('.ts') ? '' : extname(remotePath)
  return `${
    relative(localDir, remoteDir) || '.'
  }/${remoteBasename}${remoteExtname}`
}
