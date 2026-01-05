import {
  Generator as $Generator,
  GeneratorOptions as $GeneratorOptions,
} from '@runtyping/generator'
import JoiTypeWriters from './TypeWriters'

type GeneratorOptions = Omit<$GeneratorOptions, 'typeWriters'>

export default class Generator extends $Generator {
  constructor(options: GeneratorOptions) {
    super({
      ...options,
      typeWriters: new JoiTypeWriters(),
    })
  }
}
