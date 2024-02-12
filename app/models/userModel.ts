const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    userId: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    amount: { type: Number },
    status: { type: String },
  },
  { timestamps: true },
);
const User =
  mongoose.models.tbl_users || mongoose.model("tbl_users", UserSchema);

export default User;
