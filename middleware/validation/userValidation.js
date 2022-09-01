import Joi from "joi";

//LOGIN VALIDATION
export const loginSchema = Joi.object({
  Email: Joi.string().email().lowercase().required(),

  Password: Joi.string().min(2).required(),
});

//REGISTER VALIDATION
export const signupSchema = Joi.object({
  Name: Joi.string().required(),
  Email: Joi.string().email().lowercase().required(),
  Password: Joi.string().min(6).max(32).required(),
  confirmPassword: Joi.any().valid(Joi.ref("Password")).required(),
});

//NEW PASSWORD VALIDATION
export const resetPassSchema = Joi.object({
  Password: Joi.string().min(6).max(32).required(),
  confirmPassword: Joi.any().valid(Joi.ref("Password")).required(),
});
