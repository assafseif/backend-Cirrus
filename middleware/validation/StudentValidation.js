import Joi from "joi";

//Student VALIDATION
export const StudentSchema = Joi.object({
  Name: Joi.string().required(),
  Birthday: Joi.date().min("01/01/1960").max("12/31/2003"),
  Address: Joi.string().required(),
  Grade: Joi.string().required(),
});
