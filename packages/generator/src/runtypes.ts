import * as z from 'zod'
import { zodGuard } from './util'

export const InstructionSourceType = z.object({
  file: z.string(),
  exportStaticType: z.boolean().optional(),
  type: z.string().or(z.array(z.string())),
})

export type InstructionSourceType = z.infer<typeof InstructionSourceType>

export const Instruction = z.object({
  runtypeFormat: z.string().optional(),
  sourceTypes: InstructionSourceType.or(z.array(InstructionSourceType)),
  targetFile: z.string(),
  typeFormat: z.string().optional(),
})

export type Instruction = z.infer<typeof Instruction>

export const Instructions = Instruction.or(z.array(Instruction))

export type Instructions = z.infer<typeof Instructions>

const ImportSpecBase = z.object({ source: z.string() })

export const NamedImportSpec = ImportSpecBase.extend({
  name: z.string(),
  alias: z.string().optional(),
})

export type NamedImportSpec = z.infer<typeof NamedImportSpec>

export const DefaultImportSpec = ImportSpecBase.extend({
  default: z.string(),
})

export type DefaultImportSpec = z.infer<typeof DefaultImportSpec>

export const isDefaultImportSpec = zodGuard(DefaultImportSpec)

export const ImportSpec = z.union([NamedImportSpec, DefaultImportSpec])

export type ImportSpec = z.infer<typeof ImportSpec>
