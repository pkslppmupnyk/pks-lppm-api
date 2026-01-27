// models/config.model.js
import mongoose from "mongoose";

const configSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    description: String,
  },
  { timestamps: true },
);

const Config = mongoose.model("Config", configSchema);
export default Config;
