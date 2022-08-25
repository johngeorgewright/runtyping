#!/usr/bin/env node

import { cli } from '@runtyping/generator'
import JoiTypeWriters from './JoiTypeWriters'

cli('runtyping.yml', new JoiTypeWriters()).catch(console.error)
