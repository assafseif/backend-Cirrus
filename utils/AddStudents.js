import Teacher from "../model/Teacher.js";
import Student from "../model/Student.js";

export async function addStudents(students, NewTeacher, user) {
  //return if no Students added
  if (students.length === 0) return;
  let NonRegisteredStudents = [];

  //get length of array of students
  const StudentsLength = parseInt(students.length);
  for (var i = 0; i < StudentsLength; i++) {
    //assign student string body to name variable
    const id = students[i];
    const exist = await Student.findOne({ _id: id });
    //push StudentId to the  Teacher-students array if it already exists
    if (exist) {
      await Teacher.updateOne(
        {
          creator: user._id,
          _id: NewTeacher._id,
        },
        { $push: { Students: exist._id } }
      );
    } else {
      //if not we push the name and send it to the client side to tell the user to add another name or add this student
      NonRegisteredStudents.push(exist.Name);
    }
  }
  return NonRegisteredStudents;
}
