import {
  signupSchema,
  loginSchema,
} from "../../middleware/validation/userValidation.js";

import transporter from "../../utils/nodemailer.js";
import User from "../../model/User.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import crypto from "crypto";

//REGISTER
export const register = async (req, res, next) => {
  try {
    //validate user input
    const result = await signupSchema.validateAsync(req.body);

    //check if email exist
    const exists = await User.findOne({ Email: result.Email });
    if (exists)
      return res.status(409).json({
        success: false,
        error: "Conflict",
        message: ` ${result.Email} has already been registered`,
      });
    //ELSE CREATE NEW USE
    const user = new User(result);
    //genarate encrypted email token to be used for account activation
    const newToken = crypto.randomBytes(64).toString("hex");

    //SAVE TOKEN TO DB
    user.emailToken = newToken;
    //SET MAX AGE FOR THIS TOKEN
    user.userTokenExpires = Date.now() + 3600000;

    const savedUser = await user.save();

    // //ACTIVATION EMAIL TEMPLATE
    const sendedemail = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: result.Email,
      subject: "Email Verification",
      html: `<h2> Welcome, ${result.Name}!</h2>
            <br/>
            <p>Thank you for registering, you are almost done. Please read the below message to continue.</p>
            <br/>
            <p>In order to confirm your email, kindly click the verification link below.</p>
            <br/>
            <a href="http://${req.headers.host}/auth/verify?token=${user.emailToken}">Click here to verify</a>`,
    });

    return res.status(201).json({
      message: "Please Verify Your Email, Token In Your Inbox!",
      success: true,
      user: savedUser,
    });
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};

//LOGIN
export const login = async (req, res, next) => {
  try {
    //validate input
    const result = await loginSchema.validateAsync(req.body);
    //check if email exists
    const user = await User.findOne({ Email: result.Email });
    if (!user)
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "User Not found",
      });
    //CHECKING USER IF HE IS VERIFIED BEFORE SIGNING IN
    if (user.isVerified === false) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Please verify your email.",
      });
    }
    //calls the isvalidpassword to check if the password is the same
    const isMatch = await user.isValidPassword(result.Password);

    if (!isMatch)
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid Email or Password",
      });
    //Generate Token
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      "secret",
      { expiresIn: "24h" }
    );
    //SEND SUCCESS MESSAGE WITH JWT TO USE IT IN CLIENT SIDE
    res.status(200).send({ success: true, jwt: token });
  } catch (e) {
    if (e.isJoi === true) e.status = 422;
    next(e);
  }
};

//REFRESHTOKEN
export const refreshToken = async (req, res, next) => {
  try {
    //check if email exist
    const user = await User.findOne({ Email: req.body.Email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "Email not found..",
      });
    }
    //genarate encrypted email token to be used for account activation
    const newToken = crypto.randomBytes(64).toString("hex");

    //SAVE TOKEN TO DB
    user.emailToken = newToken;
    //SET MAX AGE FOR THIS TOKEN
    user.userTokenExpires = Date.now() + 3600000;

    const savedUser = await user.save();

    // //ACTIVATION EMAIL TEMPLATE
    const sendedemail = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: user.Email,
      subject: "Refresh Token",
      html: `<h2> Welcome, ${user.Name}!</h2>
            <br/>
            <p>Thank you for registering, you are almost done. Please read the below message to continue.</p>
            <br/>
            <p>In order to confirm your email, kindly click the verification link below.</p>
            <br/>
            <a href="http://${req.headers.host}/auth/verify?token=${user.emailToken}">Click here to verify</a>`,
    });

    return res.status(200).json({
      success: true,
      message: "Token In Your Inbox!",
    });
  } catch (err) {
    next(err);
  }
};
