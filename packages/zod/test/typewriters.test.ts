import testTypeWriters from '@runtyping/test-type-writers'
import ZodTypeWriters from '../src/ZodTypeWriters'

testTypeWriters({ module: 'zod', typeWriters: new ZodTypeWriters() })
