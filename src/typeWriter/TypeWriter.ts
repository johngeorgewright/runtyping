import {
  Declare,
  DeclareAndUse,
  Import,
  ImportFromSource,
  Static,
  Write,
} from './symbols'

type TypeWriter = Generator<
  | [typeof Import, string]
  | [typeof ImportFromSource, { name: string; alias: string }]
  | [typeof Write, string]
  | [typeof Declare, string]
  | [typeof DeclareAndUse, string]
  | [typeof Static, string],
  any,
  undefined | boolean | DeclaredType
>

export default TypeWriter

export interface DeclaredType {
  runTypeName: string
  typeName: string
}
