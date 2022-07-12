export type Student = {
  type: 'student'
  teacher: Teacher
}

export type Teacher = {
  type: 'teacher'
  students: Array<Student>
  reportsTo: Teacher
}

export type User = Student | Teacher
