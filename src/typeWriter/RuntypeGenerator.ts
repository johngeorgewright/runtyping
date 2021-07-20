import { Declare, Import, ImportFromSource, Write } from './symbols'

type RuntypeGenerator = Generator<
  | [typeof Import, string]
  | [typeof ImportFromSource, string]
  | [typeof Write, string]
  | [typeof Declare, string],
  any,
  undefined | boolean
>

export default RuntypeGenerator
