import testTypeWriter from '@runtyping/generator/dist/test-typewriter'
import RuntypesTypeWriters from '../src/RuntypesTypeWriters'

testTypeWriter({ module: 'runtypes', typeWriters: new RuntypesTypeWriters() })
