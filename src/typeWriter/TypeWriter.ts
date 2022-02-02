import {
  Declare,
  DeclareAndUse,
  Import,
  ImportFromSource,
  Static,
  Write,
} from './symbols'

type TypeWriter<R = any> = Generator<
  | [action: typeof Import, runtypeName: string]
  | [
      action: typeof ImportFromSource,
      sourceType: { name: string; alias: string }
    ]
  | [action: typeof Write, contents: string]
  | [action: typeof Declare, name: string]
  | [action: typeof DeclareAndUse, name: string]
  | [action: typeof Static, staticImplementation: string],
  R,
  undefined | boolean | DeclaredType
>

export default TypeWriter

export interface DeclaredType {
  runTypeName: string
  typeName: string
}
