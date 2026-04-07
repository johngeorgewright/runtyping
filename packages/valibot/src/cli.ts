#!/usr/bin/env node

import { cli } from '@runtyping/generator'
import ValibotTypeWriters from './ValibotTypeWriters.js'

cli('runtyping.yml', new ValibotTypeWriters()).catch(console.error)
