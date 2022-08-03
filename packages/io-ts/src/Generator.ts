import { Generator, GeneratorOptions } from '@runtyping/generator'
import IoTsTypeWriters from './IoTsTypeWriters'

type IoTsGeneratorOptions = Omit<GeneratorOptions, 'typeWriters'>

export default class IoTsGenerator extends Generator {
  constructor(options: IoTsGeneratorOptions) {
    super({
      ...options,
      typeWriters: new IoTsTypeWriters(),
    })
  }
}
