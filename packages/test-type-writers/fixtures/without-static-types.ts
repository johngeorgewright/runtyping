type One = {
  type: 'one'
  value: string
}

type Two = {
  type: 'two'
  value: number
}

export type Three = One | Two
