import isAuth from "../middleware/secure/isPermitted.js";

import {
  addStudent,
  editStudent,
  FetchStudents,
  DeleteStudent,
  GetStudent,
} from "../controllers/StudentController.js";

import express from "express";

const router = express.Router();
router.get("/get-students", FetchStudents);
router.post("/add-student", isAuth, addStudent);
router.put("/edit-student/:studentId", isAuth, editStudent);
router.delete("/delete-student/:studentId", isAuth, DeleteStudent);
router.get("/get-student/:studentId", isAuth, GetStudent);
export default router;
