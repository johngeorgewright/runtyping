#!/usr/bin/env node

import { cli } from '@runtyping/generator'
import IoTsTypeWriters from './IoTsTypeWriters'

cli('runtyping.yml', new IoTsTypeWriters()).catch(console.error)
