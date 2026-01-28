import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    studentEmail: {
      type: String,
      required: true,
    },
    answers: {
      type: Object, // { questionId: answer }
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    mcqScore: { type: Number, default: 0 },
longAnswerMarks: { type: Number, default: 0 },
finalScore: { type: Number, default: 0 },

  },
  { timestamps: true }
);

export default mongoose.model("Result", resultSchema);
