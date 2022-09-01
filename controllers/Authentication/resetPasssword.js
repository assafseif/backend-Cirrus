import { resetPassSchema } from "../../middleware/validation/userValidation.js";
import transporter from "../../utils/nodemailer.js";
import User from "../../model/User.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import crypto from "crypto";

//SEND FORGOT PASSWORD EMAIL
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ Email: req.body.Email });
    if (!user)
      return res.status(404).json({
        success: false,
        error: "NotFound",
        message: "User Not found",
      });
    //if founnd create new token for password url
    const newToken = crypto.randomBytes(64).toString("hex");
    //SAVE TOKEN TO DB
    user.emailToken = newToken;
    //SET MAX AGE FOR THIS TOKEN
    user.userTokenExpires = Date.now() + 3600000;

    const savedUser = await user.save();

    //send email to user with reset url
    const sendedemail = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: user.Email,
      subject: "Reset Password",
      html: `<h2> Dear, ${user.Name}.</h2>
        <br/>
            <p>Your reset password link is available below.</p>
            <br/>
            <a href="http://${req.headers.host}/auth/resetPassword?token=${newToken}">Reset</a>`,
    });

    //send message that email was sent
    return res.status(200).json({
      success: true,
      message: `Verification Password sent to ${savedUser.Email}!`,
    });
  } catch (e) {
    next(e);
  }
};

// //RESET PASSWORD
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.query;
    //validate new pass
    const result = await resetPassSchema.validateAsync(req.body);
    //check if user found
    //verify that the password token is valid
    const user = await User.findOne({
      emailToken: token,
      userTokenExpires: { $gt: Date.now() },
    });
    if (user) {
      //salt and hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(result.Password, salt);

      //Update variables in user
      user.Password = hashedPassword;
      user.emailToken = "null";
      user.userTokenExpires = 0;

      //update password in database
      const savedUser = await user.save();
      //send message that req was successful
      return res.status(201).json({
        success: true,
        message: "Password Successfully Updated.",
      });
    }
    //IF THERE IS NO USER THATS MEAN THERE IS NO TOKEN OR TOKEN IS WRONG OR EXPIRED
    return res.status(409).json({
      success: false,
      error: "NotFound",
      message: "TOKEN not found..",
    });
  } catch (e) {
    if (e.isJoi === true) e.status = 422;
    next(e);
  }
};
