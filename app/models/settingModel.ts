const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SettingSchema = new Schema(
  {
    id: { type: String, required: true },
    apikey: { type: String },
    redirectURL: { type: String },
    mistralapikey: { type: String },
    limit: { type: Number },
  },
  { timestamps: true },
);
const Setting =
  mongoose.models.tbl_setting || mongoose.model("tbl_setting", SettingSchema);

export default Setting;
