import { TeacherSchema } from "../middleware/validation/TeacherValidation.js";
import { addStudents } from "../utils/AddStudents.js";
import Teacher from "../model/Teacher.js";
import User from "../model/User.js";
//ADD TEACHER
export const addTeacher = async (req, res, next) => {
  try {
    //validate user input
    const { Name, Address, Birthday, Students } = req.body;
    const result = await TeacherSchema.validateAsync({
      Name,
      Address,
      Birthday,
    });
    //geting the user and check if exist
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("something went wrong");
      error.statusCode = 503;
      throw error;
    }
    const Exist = await Teacher.findOne({ Name: Name, Birthday: Birthday });
    if (Exist) {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "Teacher already exists..",
      });
    }
    const NewTeacher = new Teacher({
      Name: Name,
      Address: Address,
      Birthday: Birthday,
      Student: [],
      creator: req.userId,
    });
    const AwaitNewTeacher = await NewTeacher.save();
    const NonregisteredStudent = await addStudents(Students, NewTeacher, user);
    res.status(201).json({
      success: true,
      message: "New Teacher created!",
      NonregisteredStudent: NonregisteredStudent,
    });
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};
//Fetching all Teachers
export const FetchTeachers = async (req, res, next) => {
  try {
    //FIND ALL TEACHERS AND POPULATE STUDENTS
    const teachers = await Teacher.find().populate("Students");
    //IF LENGTH IS 0 THERE IS NO TEACHERS
    if (teachers.length === 0) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "No such Teachers found..",
      });
    }

    return res.status(200).json({
      count: teachers.length,
      success: true,
      data: teachers,
    });
  } catch (err) {
    next(err);
  }
};

//EDIT TEACHER
export const EditTeacher = async (req, res, next) => {
  try {
    //validate user input
    const { Name, Address, Birthday, Students } = req.body;
    const result = await TeacherSchema.validateAsync({
      Name,
      Address,
      Birthday,
    });
    //geting the user and check if exist
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("something went wrong");
      error.statusCode = 503;
      throw error;
    }
    //CHECK IF EXIST AND IF ITS NO SEND ERROR
    const Exist = await Teacher.findOne({ _id: req.params.teacherId });
    if (!Exist) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Teacher Not Found",
      });
    }
    //CHECK BY NAME AND BIRTHDAY
    const checkByNameAndByBirthday = await Teacher.findOne({
      _id: { $ne: req.params.teacherId },
      Name: Name,
      Birthday: Birthday,
    });
    //IF EXIST SEND ERROR
    if (checkByNameAndByBirthday) {
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: "Teacher already exists..",
      });
    }
    //ELSE UPDATE
    await Teacher.updateOne(
      {
        _id: req.params.teacherId,
      },
      {
        $set: {
          Name: Name,
          Birthday: Birthday,
          Address: Address,
          Students: [],
        },
      }
    );
    //THEN FILL IT WITH STUDENTS ID AND SEND BACK IF WANTED TO THE CLIENT IF ERROR OCCURED
    const NonregisteredStudent = await addStudents(Students, Exist, user);
    res.status(201).json({
      success: true,
      message: "Teacher Updated!",
      NonregisteredStudent: NonregisteredStudent,
    });
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};

//DELETE TEACHER
export const DeleteTeacher = async (req, res, next) => {
  try {
    //geting the user and check if exist
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("something went wrong");
      error.statusCode = 503;
      throw error;
    }
    //Searching for Teacher with this Id And check if exist
    const teacher = await Teacher.findOne({
      creator: req.userId,
      _id: req.params.teacherId,
    });
    //return message if it doesnt
    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "No such Teacher found.",
      });
    }
    const awaitedDeleteTeacher = await Teacher.deleteOne({
      creator: req.userId,
      _id: req.params.teacherId,
    });
    res.status(201).json({
      success: true,
      message: "Teacher Deleted!",
      data: awaitedDeleteTeacher,
    });
  } catch (e) {
    next(e);
  }
};

//GET SINGLE TECHER BY ID
export const GetTeacher = async (req, res, next) => {
  try {
    //CHECK IF THIS USER WHO CREATED THIS TEACHER
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("something went wrong");
      error.statusCode = 503;
      throw error;
    }
    //SEARCHING FOR TEACHER AND POPULATE STUDENTS
    const teacher = await Teacher.findOne({
      _id: req.params.teacherId,
    }).populate("Students");

    if (!teacher)
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "teacher Not Found..",
      });
    res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (e) {
    next(e);
  }
};
