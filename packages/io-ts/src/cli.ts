#!/usr/bin/env node

import { cli } from '@runtyping/generator'
import IoTsTypeWriters from './IoTsTypeWriters.js'

cli('runtyping.yml', new IoTsTypeWriters()).catch(console.error)
