import testTypeWriter from '@runtyping/generator/dist/test-typewriter'
import ZodTypeWriters from '../src/ZodTypeWriters'

testTypeWriter({ module: 'zod', typeWriters: new ZodTypeWriters() })
