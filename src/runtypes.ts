import { Array, Record, String, Static, Optional } from 'runtypes'

export const InstructionSourceType = Record({
  file: String,
  type: String.Or(Array(String)),
})

export type InstructionSourceType = Static<typeof InstructionSourceType>

export const Instruction = Record({
  targetFile: String,
  sourceTypes: Array(InstructionSourceType),
  runtypeFormat: Optional(String),
  typeFormat: Optional(String),
})

export type Instruction = Static<typeof Instruction>

export const Instructions = Array(Instruction)

export type Instructions = Static<typeof Instructions>
