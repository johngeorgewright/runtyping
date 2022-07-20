import testTypeWriters from '@runtyping/test-type-writers'
import RuntypesTypeWriters from '../src/RuntypesTypeWriters'

testTypeWriters({ module: 'runtypes', typeWriters: new RuntypesTypeWriters() })
