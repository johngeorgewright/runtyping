import { Generator, GeneratorOptions } from '@runtyping/generator'
import ZodTypeWriters from './ZodTypeWriters'

type ZodGeneratorOptions = Omit<GeneratorOptions, 'module' | 'typeWriters'>

export default class ZodGenerator extends Generator {
  constructor(options: ZodGeneratorOptions) {
    super({
      ...options,
      module: 'zod',
      typeWriters: new ZodTypeWriters(),
    })
  }
}
