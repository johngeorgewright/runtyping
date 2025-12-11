#!/usr/bin/env node

import { cli } from '@runtyping/generator'
import ZodMiniTypeWriters from './ZodMiniTypeWriters'

cli('runtyping.yml', new ZodMiniTypeWriters()).catch(console.error)
