import TypeWriter from './TypeWriter'
import { Import, Write } from './symbols'
import * as runtypes from 'runtypes'

export default function* simpleTypeWriter(
  type: keyof typeof runtypes
): TypeWriter {
  yield [Import, type]
  yield [Write, type]
}
