import TypeWriter from './TypeWriter'
import { Import, Write } from './symbols'
import * as runtypes from 'runtypes'

export default function* simpleTypeGenerator(
  type: keyof typeof runtypes
): TypeWriter {
  yield [Import, type]
  yield [Write, type]
}
