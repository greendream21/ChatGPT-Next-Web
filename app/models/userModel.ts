const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    userId: { type: String, required: true },
    userEmail: { type: String },
    query: { type: Number },
    customer: { type: String },
    subscription_id: { type: String },
    amount: { type: Number },
  },
  { timestamps: true },
);
const User =
  mongoose.models.tbl_users || mongoose.model("tbl_users", UserSchema);

export default User;
