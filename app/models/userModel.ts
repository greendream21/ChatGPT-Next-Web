const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    userEmail: { type: String, required: true },
    amount: { type: Number },
    status: { type: String },
  },
  { timestamps: true },
);
const User =
  mongoose.models.tbl_users || mongoose.model("tbl_users", UserSchema);

export default User;
