#!/usr/bin/env node

import { cli } from '@runtyping/generator'
import ZodTypeWriters from './ZodTypeWriters.js'

cli('runtyping.yml', new ZodTypeWriters()).catch(console.error)
