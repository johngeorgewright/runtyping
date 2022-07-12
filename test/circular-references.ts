export type Student = {
  type: 'student'
  teacher: Teacher
}

export type Teacher = {
  type: 'teacher'
  students: Array<Student>
}

export type User = Student | Teacher
