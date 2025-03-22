import { Generator, GeneratorOptions } from '@runtyping/generator'
import ValibotTypeWriters from './ValibotTypeWriters'

type ValibotGeneratorOptions = Omit<GeneratorOptions, 'typeWriters'>

export default class ValibotGenerator extends Generator {
  constructor(options: ValibotGeneratorOptions) {
    super({
      ...options,
      typeWriters: new ValibotTypeWriters(),
    })
  }
}
