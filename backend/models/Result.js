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
    answers: Object,
    mcqScore: Number,
    longAnswerMarks: Number,
    finalScore: Number,
    totalMarks: Number,
  },
  { timestamps: true }
);

//this line is to prevent multiple attempts
resultSchema.index({ examId: 1, studentEmail: 1 }, { unique: true });

export default mongoose.model("Result", resultSchema);
