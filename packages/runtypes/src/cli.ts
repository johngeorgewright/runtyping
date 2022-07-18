#!/usr/bin/env node

import { cli } from '@runtyping/generator'
import RuntypesTypeWriterFactory from './RuntypesTypeWriterFactory'

cli('runtyping.yml', 'runtypes', new RuntypesTypeWriterFactory()).catch(
  console.error
)
