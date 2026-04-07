#!/usr/bin/env node

import { cli } from '@runtyping/generator'
import TypeWriters from './TypeWriters.js'

cli('runtyping.yml', new TypeWriters()).catch(console.error)
