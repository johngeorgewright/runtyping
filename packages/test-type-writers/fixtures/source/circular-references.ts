import { HeadMaster } from './circular-references-2.js'

export type Student = {
  type: 'student'
  teacher: Teacher
}

export type Teacher = {
  type: 'teacher'
  students?: Array<Student>
  reportsTo?: HeadMaster
}

export type User = Student | Teacher
