import RuntypeGenerator from './RuntypeGenerator'
import { Import, Write } from './symbols'

export default function* simpleTypeGenerator(type: string): RuntypeGenerator {
  yield [Import, type]
  yield [Write, type]
}
