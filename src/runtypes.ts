import { Record, String, Array, Static } from 'runtypes'

export const InstructionSourceType = Record({
  file: String,
  type: String.Or(Array(String)),
})

export type InstructionSourceType = Static<typeof InstructionSourceType>

export const Instruction = Record({
  targetFile: String,
  sourceTypes: InstructionSourceType.Or(Array(InstructionSourceType)),
  runtypeFormat: String.optional(),
  typeFormat: String.optional(),
})

export type Instruction = Static<typeof Instruction>

export const Instructions = Instruction.Or(Array(Instruction))

export type Instructions = Static<typeof Instructions>
