import { Generator, GeneratorOptions } from '@runtyping/generator'
import ZodMiniTypeWriters from './ZodMiniTypeWriters.js'

type ZodGeneratorOptions = Omit<GeneratorOptions, 'typeWriters'>

export default class ZodGenerator extends Generator {
  constructor(options: ZodGeneratorOptions) {
    super({
      ...options,
      typeWriters: new ZodMiniTypeWriters(),
    })
  }
}
