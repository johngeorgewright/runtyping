#!/usr/bin/env node

import { cli } from '@runtyping/generator'
import RuntypesTypeWriterFactory from './RuntypesTypeWriterFactory'

cli('runtyping.yml', new RuntypesTypeWriterFactory()).catch(console.error)
