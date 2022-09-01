import mongoose from "mongoose";
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
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
  Grade: {
    type: String,
    required: true,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
StudentSchema.index({ Name: -1 });
StudentSchema.index({ Birthday: -1 });
export default mongoose.model("Student", StudentSchema);
