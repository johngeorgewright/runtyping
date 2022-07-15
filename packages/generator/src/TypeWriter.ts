import { Type } from 'ts-morph'

export const Write = Symbol.for('@runtypes/generator/TypeWriter/Write')
export const Import = Symbol.for('@runtypes/generator/TypeWriter/Import')
export const ImportFromSource = Symbol.for(
  '@runtypes/generator/TypeWriter/ImportFromSource'
)
export const Declare = Symbol.for('@runtypes/generator/TypeWriter/Declare')
export const DeclareAndUse = Symbol.for(
  '@runtypes/generator/TypeWriter/DeclareAndUse'
)
export const DeclareType = Symbol.for(
  '@runtypes/generator/TypeWriter/DeclareType'
)
export const Static = Symbol.for('@runtypes/generator/TypeWriter/Static')

export type TypeWriter<R = any> = Generator<
  | [action: typeof Import, runtypeName: string]
  | [
      action: typeof ImportFromSource,
      sourceType: { name: string; alias: string }
    ]
  | [action: typeof Write, contents: string]
  | [action: typeof Declare, name: string]
  | [action: typeof DeclareAndUse, name: string]
  | [action: typeof DeclareType, type: string]
  | [action: typeof Static, staticImplementation: string],
  R,
  undefined | boolean | DeclaredType
>

export interface DeclaredType {
  runTypeName: string
  typeName: string
}

export type Factory = (
  type: Type,
  name?: string,
  options?: {
    recursive?: boolean
    circular?: boolean
  }
) => TypeWriter
