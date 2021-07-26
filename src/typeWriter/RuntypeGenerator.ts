import { Declare, Import, ImportFromSource, Static, Write } from './symbols'

type RuntypeGenerator = Generator<
  | [typeof Import, string]
  | [typeof ImportFromSource, string]
  | [typeof Write, string]
  | [typeof Declare, string]
  | [typeof Static, string],
  any,
  undefined | boolean
>

export default RuntypeGenerator
