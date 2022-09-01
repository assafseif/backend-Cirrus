import isAuth from "../middleware/secure/isPermitted.js";

import {
  addTeacher,
  FetchTeachers,
  EditTeacher,
  DeleteTeacher,
  GetTeacher,
} from "../controllers/TeacherController.js";

import express from "express";

const router = express.Router();
router.post("/add-teacher", isAuth, addTeacher);
router.get("/fetch-teachers", FetchTeachers);
router.put("/edit-teacher/:teacherId", isAuth, EditTeacher);
router.delete("/delete-teacher/:teacherId", isAuth, DeleteTeacher);
router.get("/get-teacher/:teacherId", isAuth, GetTeacher);
export default router;
