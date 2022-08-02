import { Generator, GeneratorOptions } from '@runtyping/generator'
import ZodTypeWriters from './ZodTypeWriters'

type ZodGeneratorOptions = Omit<GeneratorOptions, 'typeWriters'>

export default class ZodGenerator extends Generator {
  constructor(options: ZodGeneratorOptions) {
    super({
      ...options,
      typeWriters: new ZodTypeWriters(),
    })
  }
}
