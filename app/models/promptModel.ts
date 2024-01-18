const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PromptSchema = new Schema(
  {
    id: { type: String, required: true },
    userEmail: { type: String, required: true },
    title: { type: String },
    content: { type: String },
    isUser: { type: Boolean },
  },
  { timestamps: true },
);
const Prompt =
  mongoose.models.tbl_prompts || mongoose.model("tbl_prompts", PromptSchema);

export default Prompt;
