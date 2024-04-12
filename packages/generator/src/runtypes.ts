import * as z from 'zod'

export const InstructionTypeTransformer = z.object({
  file: z.string(),
  export: z.string(),
})

export type InstructionTypeTransformer = z.infer<
  typeof InstructionTypeTransformer
>

export const InstructionTypeTransformers = z.record(InstructionTypeTransformer)

export type InstructionTypeTransformers = z.infer<
  typeof InstructionTypeTransformers
>

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
  transformers: InstructionTypeTransformers.optional(),
  typeFormat: z.string().optional(),
})

export type Instruction = z.infer<typeof Instruction>

export const Instructions = Instruction.or(z.array(Instruction))

export type Instructions = z.infer<typeof Instructions>
