import mkdirp from 'mkdirp'
import { rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { TypedArray } from 'type-fest'
import { v4 as uuidv4 } from 'uuid'

const tempDir = path.resolve(process.cwd(), 'temp')

const getPath = () => path.join(tempDir, uuidv4())

async function runTask<ReturnValueType>(
  temporaryPath: string,
  callback: TaskCallback<ReturnValueType>
) {
  try {
    return await callback(temporaryPath)
  } finally {
    await rm(temporaryPath)
  }
}

export async function temporaryFile({ extension }: FileOptions = {}) {
  await mkdirp(tempDir)
  return (
    getPath() +
    (extension === undefined || extension === null
      ? ''
      : '.' + extension.replace(/^\./, ''))
  )
}

export async function temporaryWrite(
  fileContent: string | Buffer | TypedArray | DataView | NodeJS.ReadableStream,
  options?: FileOptions
) {
  const filename = await temporaryFile(options)
  await writeFile(filename, fileContent)
  return filename
}

export async function temporaryWriteTask<ReturnValueType>(
  fileContent: string | Buffer | TypedArray | DataView | NodeJS.ReadableStream,
  callback: TaskCallback<ReturnValueType>,
  options?: FileOptions
): Promise<ReturnValueType> {
  return runTask(await temporaryWrite(fileContent, options), callback)
}

export interface FileOptions {
  readonly extension?: string
}

/**
The temporary path created by the function. Can be asynchronous.
*/
export type TaskCallback<ReturnValueType> = (
  temporaryPath: string
) => Promise<ReturnValueType> | ReturnValueType
