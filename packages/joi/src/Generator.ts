import { Generator, GeneratorOptions } from '@runtyping/generator'
import JoiTypeWriters from './JoiTypeWriters'

type JoiGeneratorOptions = Omit<GeneratorOptions, 'typeWriters'>

export default class JoiGenerator extends Generator {
  constructor(options: JoiGeneratorOptions) {
    super({
      ...options,
      typeWriters: new JoiTypeWriters(),
    })
  }
}
