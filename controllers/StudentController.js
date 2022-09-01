import { StudentSchema } from "../middleware/validation/StudentValidation.js";
import Teacher from "../model/Teacher.js";
import Student from "../model/Student.js";
import User from "../model/User.js";

//ADD STUDENT
export const addStudent = async (req, res, next) => {
  try {
    //validate user input
    const { Name, Address, Birthday, Grade } = req.body;
    const result = await StudentSchema.validateAsync(req.body);
    //geting the user and check if exist
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("something went wrong");
      error.statusCode = 503;
      throw error;
    }
    //check if this student exist before Adding it
    const Exist = await Student.findOne({ Name: Name, Birthday: Birthday });
    if (Exist) {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "Student already exists..",
      });
    }
    //ELSE CREATE NEW STUDENT
    const newStudent = new Student({
      Name: Name,
      Birthday: Birthday,
      Address: Address,
      Grade: Grade,
      creator: req.userId,
    });
    //SAVE IN COLLECTION
    const awaitedStudent = await newStudent.save();

    res.status(201).json({
      success: true,
      message: "New Student created!",
      Student: awaitedStudent,
    });
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};

//EDIT STUDENT
export const editStudent = async (req, res, next) => {
  try {
    //validate updated user input
    const result = await StudentSchema.validateAsync(req.body);
    //geting the user and check if exist
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("something went wrong");
      error.statusCode = 503;
      throw error;
    }
    //Check if This Student Exist
    const Exist = await Student.findOne({
      _id: req.params.studentId,
      creator: req.userId,
    });
    //IF !EXIST SO SOMETHING IS WRONG AND WE CANNOT EDIT
    if (!Exist) {
      return res.status(409).json({
        success: false,
        error: "NotFound",
        message: "Student not found..",
      });
    }
    //CHECK BY NAME AND BIRTHDAY
    const checkByNameAndByBirthday = await Student.findOne({
      _id: { $ne: req.params.studentId },
      Name: result.Name,
      Birthday: result.Birthday,
    });
    //IF EXIST SEND ERROR
    if (checkByNameAndByBirthday) {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "Teacher already exists..",
      });
    }
    //ELSE IF EXIST UPDATE
    const student = await Student.updateOne(
      { _id: req.params.studentId, creator: req.userId },
      result,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      success: true,
      message: "Student updated!",
      student: student,
    });
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};

//FETCH STUDENTS
export const FetchStudents = async (req, res, next) => {
  try {
    const teacherId = req?.query?.teacher;
    //checking if this teacher exist
    // ********  IF THERE IS TEACHERID THAT'S MEAN THAT WE SHOULD FIND ALL STUDENTS BELONG TO THIS TEACHER ******** //
    if (teacherId) {
      const exist = await Teacher.findOne({
        _id: teacherId,
      }).populate("Students");

      if (!exist) {
        return res.status(404).json({
          success: false,
          error: "NotFound",
          message: "Teacher not found..",
        });
      }
      return res.status(200).json({
        success: true,
        message: "done",
        students: exist.Students,
      });
    }

    //fteching all students
    const students = await Student.find().sort({
      updatedDate: -1,
    });
    res.status(200).json({
      success: true,
      count: students.length,
      Students: students,
    });
  } catch (e) {
    next(e);
  }
};

export const DeleteStudent = async (req, res, next) => {
  try {
    //geting the user and check if exist
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("something went wrong");
      error.statusCode = 503;
      throw error;
    }
    //Searching for student with this Id And check if exist
    const student = await Student.findOne({
      creator: req.userId,
      _id: req.params.studentId,
    });
    //return message if it doesnt
    if (!student) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "No such Student found.",
      });
    }

    const teacher = await Teacher.find({
      Students: { $in: [req.params.studentId] },
    });

    if (teacher.length > 0) {
      //Update all teacher by pulling student with studentId
      await Teacher.updateMany(
        {
          Students: { $in: [req.params.studentId] },
        },
        { $pullAll: { Students: [req.params.studentId] } }
      );
    }
    //delete  students with studentId
    const deletedstudent = await Student.deleteOne({
      creator: req.userId,
      _id: req.params.studentId,
    });
    return res.status(200).json({
      success: true,
      message: "Student deleted.",
    });
  } catch (e) {
    next(e);
  }
};
//FETCH SINGLE STUDENT
export const GetStudent = async (req, res, next) => {
  try {
    //geting the user and check if exist
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("something went wrong");
      error.statusCode = 503;
      throw error;
    }
    const student = await Student.findOne({
      _id: req.params.studentId,
    });
    if (!student)
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "student Not Found..",
      });
    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (e) {
    next(e);
  }
};
