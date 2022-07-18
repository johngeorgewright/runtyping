#!/usr/bin/env node

import { cli } from '@runtyping/generator'
import ZodTypeWriterFactory from './ZodTypeWriterFactory'

cli('runtyping.yml', 'zod', new ZodTypeWriterFactory()).catch(console.error)
