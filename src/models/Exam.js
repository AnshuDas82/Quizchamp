import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "questions",
        required: true,
      },
    ],

    timeLimit: { type: Number, required: true },

    examCode: {
      type: String,
      unique: true,
      required: true,
    },

    status: {
      type: String,
      enum: ["started", "ended"],
      default: "started",
    },

    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Exam", examSchema);
