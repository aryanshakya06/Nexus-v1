import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  department: {
    type: String,
    enum: ["CSE", "IT", "CSE(AI)", "ECE", "ME", "CE", "EE", "MBA", ""]
  },

  year: {
    type: String,
    enum: ["First", "Second", "Third", "Fourth", ""]
  },

  mentor: { type: String },

  technologies: [{ type: String }],
  domain: { type: String },
  tags: [{ type: String }],

  repoUrl: { type: String },

  file: {
    type: String,
    default: ""
  },

  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },

  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  active: { type: Boolean, default: true }

}, { timestamps: true });

export default mongoose.model("Project", projectSchema);
