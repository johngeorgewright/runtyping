import TypeWriter from './TypeWriter'
import { Import, Write } from './symbols'
import * as runtypes from 'runtypes'
import { PickByValue } from '../util'

/**
 * A runtype is considered "simple" when it is already a Runtype
 * and not a function that returns a Runtype.
 *
 * For example, `Number` & `String` are simple types, but
 * `Array` and `Record` are not.
 */
type SimpleRuntype = keyof PickByValue<typeof runtypes, runtypes.Runtype>

export default function* simpleTypeWriter(type: SimpleRuntype): TypeWriter {
  yield [Import, type]
  yield [Write, type]
}
