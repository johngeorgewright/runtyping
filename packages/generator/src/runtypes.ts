import * as z from 'zod'

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
