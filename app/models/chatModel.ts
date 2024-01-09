const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatSchema = new Schema(
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
const Chat = mongoose.models.tbl_chat || mongoose.model("tbl_chat", ChatSchema);

export default Chat;
