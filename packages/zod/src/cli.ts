#!/usr/bin/env node

import { cli } from '@runtyping/generator'
import ZodTypeWriters from './ZodTypeWriters'

cli('runtyping.yml', 'zod', new ZodTypeWriters()).catch(console.error)
