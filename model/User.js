import mongoose from "mongoose";
import bcrypt from "bcrypt";
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    Email: {
      type: String,
      required: true,
    },
    Password: {
      type: String,
      required: true,
    },
    Name: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailToken: {
      type: String,
    },
    userTokenExpires: {
      type: Date,
    },
  },

  {
    timestamps: true,
  }
);
UserSchema.pre("save", async function (next) {
  try {
    //  add hashed password into database
    if (this.isNew) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.Password, salt);
      this.Password = hashedPassword;
    }
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.isValidPassword = async function (Password) {
  try {
    //compare input password with hashed pass in db
    return await bcrypt.compare(Password, this.Password);
  } catch (err) {
    throw new Error(err);
  }
};
UserSchema.index({ email: -1 });
UserSchema.index({ emailToken: -1 });
export default mongoose.model("User", UserSchema);
