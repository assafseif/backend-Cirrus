import Joi from "joi";

//TEACHER VALIDATION
export const TeacherSchema = Joi.object({
  Name: Joi.string().required(),
  Birthday: Joi.date().min("01/01/1960").max("12/31/2003"),
  Address: Joi.string().required(),
});
