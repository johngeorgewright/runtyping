import { Record, String, Array, Static, Boolean } from 'runtypes'

export const InstructionSourceType = Record({
  file: String,
  exportStaticType: Boolean.optional(),
  type: String.Or(Array(String)),
})

export type InstructionSourceType = Static<typeof InstructionSourceType>

export const Instruction = Record({
  runtypeFormat: String.optional(),
  sourceTypes: InstructionSourceType.Or(Array(InstructionSourceType)),
  targetFile: String,
  typeFormat: String.optional(),
})

export type Instruction = Static<typeof Instruction>

export const Instructions = Instruction.Or(Array(Instruction))

export type Instructions = Static<typeof Instructions>
