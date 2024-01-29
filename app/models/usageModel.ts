const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UsageSchema = new Schema(
  {
    userId: { type: String, required: true },
    model: { type: String },
  },
  { timestamps: true },
);
const Usage =
  mongoose.models.tbl_usage || mongoose.model("tbl_usage", UsageSchema);

export default Usage;
