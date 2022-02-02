export interface A {
  recurse: string | A
}

export interface B {
  recurse: B[]
}
