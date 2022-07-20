import { Generator, GeneratorOptions } from '@runtyping/generator'
import RuntypesTypeWriters from './RuntypesTypeWriters'

type RuntypeGeneratorOptions = Omit<GeneratorOptions, 'module' | 'typeWriters'>

export default class RuntypeGenerator extends Generator {
  constructor(options: RuntypeGeneratorOptions) {
    super({
      ...options,
      module: 'runtypes',
      typeWriters: new RuntypesTypeWriters(),
    })
  }
}
