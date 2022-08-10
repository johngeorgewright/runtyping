import { TestData } from '../../src/types'
import * as T from '../source/circular-references'

export const User: TestData<T.User> = {
  success: [
    { type: 'student', teacher: { type: 'teacher' } },
    {
      type: 'student',
      teacher: {
        type: 'teacher',
        students: [
          {
            type: 'student',
            teacher: { type: 'teacher', reportsTo: { type: 'teacher' } },
          },
        ],
        reportsTo: { type: 'teacher' },
      },
    },
  ],
  failure: [1, 'teacher', { type: 'student' }],
}
