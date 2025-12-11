import { Generator, GeneratorOptions } from '@runtyping/generator'
import ZodMiniTypeWriters from './ZodMiniTypeWriters'

type ZodGeneratorOptions = Omit<GeneratorOptions, 'typeWriters'>

export default class ZodGenerator extends Generator {
  constructor(options: ZodGeneratorOptions) {
    super({
      ...options,
      typeWriters: new ZodMiniTypeWriters(),
    })
  }
}
