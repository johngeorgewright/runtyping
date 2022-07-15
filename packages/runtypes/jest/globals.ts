import { Factory } from '@runtyping/generator/src/TypeWriter'
import factory from '../src/typeWriter/factory'

declare global {
  var factory: Factory
}

// @ts-ignore
global.factory = factory
