import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";

const app = express();
app.use(express.json());
app.use(cors());

// This part is to connect to mongo db
mongoose
  .connect("mongodb://127.0.0.1:27017/quizchampdb")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  role: { type: String, enum: ["student", "teacher"], required: true },
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("users", userSchema);

// This part is for signup
app.post("/signup", async (req, res) => {
  const { role, name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ role, name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(400).json({ error: "Email already exists or invalid data" });
  }
});

// This part is for login
app.post("/login", async (req, res) => {
  const { role, email, password } = req.body;
  try {
    const user = await User.findOne({ email, role });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

//this part is for questions
import Question from "./question.js";

app.post("/questions", async (req, res) => {
  try {
    console.log("QUESTION PAYLOAD 👉", req.body);

    const question = new Question(req.body);
    await question.save();

    res.status(201).json(question);
  } catch (err) {
    console.error("SAVE QUESTION ERROR 👉", err);
    res.status(500).json({ error: err.message });
  }
});

import Exam from "./models/Exam.js";

const generateExamCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

app.post("/start-exam", async (req, res) => {
  try {
    const { title, questions, timeLimit, createdBy } = req.body;

    if (!title || !questions?.length || !timeLimit) {
      return res.status(400).json({ error: "Missing exam data" });
    }

    const examCode = generateExamCode();

    const questionIds = questions.map((id) => new mongoose.Types.ObjectId(id));

    const exam = new Exam({
      title,
      questions: questionIds,
      timeLimit,
      examCode,
      createdBy: createdBy.trim().toLowerCase(),
      status: "started",
    });

    await exam.save();

    res.status(201).json({
      examCode: exam.examCode,
      exam,
    });
  } catch (err) {
    console.error("START EXAM ERROR 👉", err);
    res.status(500).json({ error: err.message });
  }
});

//this part is for exam joining by students
app.get("/join-exam/:code", async (req, res) => {
  try {
    const examCode = req.params.code.trim(); // ✅ STRING

    console.log("JOIN EXAM CODE 👉", examCode);

    const exam = await Exam.findOne({
      examCode: examCode,
      status: "started",
    }).populate("questions");

    if (!exam) {
      return res.status(404).json({ error: "Invalid or expired exam code" });
    }

    res.json({ exam });
  } catch (err) {
    console.error("JOIN EXAM ERROR 👉", err);
    res.status(500).json({ error: "Server error" });
  }
});
//this part is for exam submit and auto-evaluation
import Result from "./models/Result.js";

app.post("/submit-exam", async (req, res) => {
  try {
    const { examId, studentEmail, answers } = req.body;

    const exam = await Exam.findById(examId).populate("questions");
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    let score = 0;
    let totalMarks = 0;

    exam.questions.forEach((q) => {
      if (q.type === "mcq") {
        totalMarks += 1;
        if (answers[q._id] == q.correctOption) {
          score += 1;
        }
      }
    });

    const result = new Result({
  examId,
  studentEmail,
  answers,
  mcqScore: score,
  totalMarks,
  longAnswerMarks: 0,
  finalScore: score,
});


    await result.save();

    res.json({
      message: "Exam submitted successfully",
      score,
      totalMarks,
    });
  } catch (err) {
    console.error("SUBMIT EXAM ERROR 👉", err);
    res.status(500).json({ error: "Failed to submit exam" });
  }
});
// for viewing of results by teachers
app.get("/results/:examId", async (req, res) => {
  try {
    const results = await Result.find({
      examId: req.params.examId,
    });

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch results" });
  }
});
//this is for fetching the single submission by student
app.get("/result/:resultId", async (req, res) => {
  try {
    const result = await Result.findById(req.params.resultId).populate({
      path: "examId",
      populate: { path: "questions" },
    });

    if (!result) return res.status(404).json({ error: "Result not found" });

    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch result details" });
  }
});
app.post("/grade-result", async (req, res) => {
  try {
    const { resultId, longMarks } = req.body;

    const result = await Result.findById(resultId);
    if (!result) return res.status(404).json({ error: "Result not found" });

    result.longAnswerMarks = Number(longMarks || 0);
    result.finalScore = (result.mcqScore ?? result.score ?? 0) + result.longAnswerMarks;

    await result.save();

    // ✅ populate before sending back
    const updated = await Result.findById(resultId).populate({
      path: "examId",
      populate: { path: "questions" },
    });

    res.json({ message: "Marks saved", result: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to save marks" });
  }
});
//for showing previous created exams by teachers
app.get("/teacher-exams/:email", async (req, res) => {
  try {
    const email = req.params.email.trim().toLowerCase();

    const exams = await Exam.find({ createdBy: email })
      .sort({ createdAt: -1 });

    res.json({ exams });
    console.log("TEACHER EMAIL REQUEST 👉", email);
console.log("FOUND EXAMS 👉", exams.length);

  } catch (err) {
    console.log("FETCH EXAMS ERROR 👉", err);
    res.status(500).json({ error: "Failed to fetch exams" });
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
