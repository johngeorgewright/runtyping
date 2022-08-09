import cryptoRandomString from './crypto-random-string'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import { MergeExclusive, TypedArray } from 'type-fest'

const tempDir = path.resolve(__dirname, '..', 'temp')

const getPath = (prefix = '') => path.join(tempDir, prefix + uniqueString())

export default function uniqueString() {
  return cryptoRandomString({ length: 32 })
}

async function runTask<ReturnValueType>(
  temporaryPath: string,
  callback: TaskCallback<ReturnValueType>
) {
  try {
    return await callback(temporaryPath)
  } finally {
    await fsPromises.rm(temporaryPath, { recursive: true, force: true })
  }
}

export function temporaryFile({ name, extension }: FileOptions = {}) {
  if (name) {
    if (extension !== undefined && extension !== null) {
      throw new Error(
        'The `name` and `extension` options are mutually exclusive'
      )
    }

    return path.join(temporaryDirectory(), name)
  }

  return (
    getPath() +
    (extension === undefined || extension === null
      ? ''
      : '.' + extension.replace(/^\./, ''))
  )
}

export const temporaryFileTask = async <ReturnValueType>(
  callback: TaskCallback<ReturnValueType>,
  options?: FileOptions
): Promise<ReturnValueType> => runTask(temporaryFile(options), callback)

export function temporaryDirectory({ prefix = '' }: DirectoryOptions = {}) {
  const directory = getPath(prefix)
  fs.mkdirSync(directory)
  return directory
}

export const temporaryDirectoryTask = async <ReturnValueType>(
  callback: TaskCallback<ReturnValueType>,
  options?: DirectoryOptions
): Promise<ReturnValueType> => runTask(temporaryDirectory(options), callback)

export async function temporaryWrite(
  fileContent: string | Buffer | TypedArray | DataView | NodeJS.ReadableStream,
  options?: FileOptions
) {
  const filename = temporaryFile(options)
  await fsPromises.writeFile(filename, fileContent)
  return filename
}

export const temporaryWriteTask = async <ReturnValueType>(
  fileContent: string | Buffer | TypedArray | DataView | NodeJS.ReadableStream,
  callback: TaskCallback<ReturnValueType>,
  options?: FileOptions
): Promise<ReturnValueType> =>
  runTask(await temporaryWrite(fileContent, options), callback)

export function temporaryWriteSync(
  fileContent: string | Buffer | TypedArray | DataView,
  options?: FileOptions
): string {
  const filename = temporaryFile(options)
  fs.writeFileSync(filename, fileContent)
  return filename
}

export type FileOptions = MergeExclusive<
  {
    /**
	File extension.
	Mutually exclusive with the `name` option.
	_You usually won't need this option. Specify it only when actually needed._
	*/
    readonly extension?: string
  },
  {
    /**
	Filename.
	Mutually exclusive with the `extension` option.
	_You usually won't need this option. Specify it only when actually needed._
	*/
    readonly name?: string
  }
>

export type DirectoryOptions = {
  /**
	Directory prefix.
	_You usually won't need this option. Specify it only when actually needed._
	Useful for testing by making it easier to identify cache directories that are created.
	*/
  readonly prefix?: string
}

/**
The temporary path created by the function. Can be asynchronous.
*/
export type TaskCallback<ReturnValueType> = (
  temporaryPath: string
) => Promise<ReturnValueType> | ReturnValueType
