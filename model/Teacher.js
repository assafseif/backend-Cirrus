import mongoose from "mongoose";
const Schema = mongoose.Schema;

const TeacherSchema = new Schema({
  Name: {
    type: String,
    required: true,
  },
  Birthday: {
    type: Date,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
  Students: [
    {
      type: Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

TeacherSchema.index({ Name: -1 });
TeacherSchema.index({ Birthday: -1 });
export default mongoose.model("Teacher", TeacherSchema);
