import { Declare, Import, ImportFromSource, Static, Write } from './symbols'

type TypeWriter = Generator<
  | [typeof Import, string]
  | [typeof ImportFromSource, { name: string; alias: string }]
  | [typeof Write, string]
  | [typeof Declare, string]
  | [typeof Static, string],
  any,
  undefined | boolean
>

export default TypeWriter
