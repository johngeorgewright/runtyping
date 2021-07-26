import RuntypeGenerator from './RuntypeGenerator'
import { Import, Write } from './symbols'
import * as runtypes from 'runtypes'

export default function* simpleTypeGenerator(
  type: keyof typeof runtypes
): RuntypeGenerator {
  yield [Import, type]
  yield [Write, type]
}
