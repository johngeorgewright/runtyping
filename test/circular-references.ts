type Student = {
  type: 'student'
  teacher: Teacher
}

type Teacher = {
  type: 'teacher'
  students: Array<Student>
}

export type User = Student | Teacher
