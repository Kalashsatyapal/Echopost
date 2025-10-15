// models/Guidelines.js
import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  rules: [{ type: String }],
});

const guidelinesSchema = new mongoose.Schema(
  {
    sections: [sectionSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Guidelines", guidelinesSchema);
