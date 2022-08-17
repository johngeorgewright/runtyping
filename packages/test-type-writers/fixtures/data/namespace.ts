import { TestData } from '../../src/types'
import * as T from '../source/namespace'

export namespace A {
  export const $namespace = true

  export const B: TestData<T.A.B> = {
    success: [{ C: 'foo' }],
    failure: [],
  }
}

export namespace B {
  export const $namespace = true

  export namespace C {
    export const $namespace = true

    export const D: TestData<T.B.C.D> = {
      success: [1],
      failure: ['foo'],
    }
  }
}

export namespace A {
  export const C: TestData<T.A.C> = {
    success: [1, 'foo', null, undefined],
    failure: [],
  }

  export const D: TestData<T.A.D> = {
    success: [{ E: 1 }],
    failure: [{ E: 'foo' }],
  }
}
