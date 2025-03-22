#!/usr/bin/env node

import { cli } from '@runtyping/generator'
import ValibotTypeWriters from './ValibotTypeWriters'

cli('runtyping.yml', new ValibotTypeWriters()).catch(console.error)
