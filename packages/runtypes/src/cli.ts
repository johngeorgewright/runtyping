#!/usr/bin/env node

import { cli } from '@runtyping/generator'
import RuntypesTypeWriters from './RuntypesTypeWriters.js'

cli('runtyping.yml', new RuntypesTypeWriters()).catch(console.error)
