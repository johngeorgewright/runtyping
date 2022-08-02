#!/usr/bin/env node

import { cli } from '@runtyping/generator'
import RuntypesTypeWriters from './RuntypesTypeWriters'

cli('runtyping.yml', new RuntypesTypeWriters()).catch(console.error)
