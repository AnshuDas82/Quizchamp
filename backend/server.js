import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import result from "./models/result.js";
import Question from "./models/question.js";
import Exam from "./models/Exam.js";

const app = express();
app.use(express.json());
app.use(cors());

/*Database*/
mongoose
  .connect("mongodb://127.0.0.1:27017/quizchampdb")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

/*User*/
const userSchema = new mongoose.Schema({
  role: { type: String, enum: ["student", "teacher"], required: true },
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("users", userSchema);

/*Signup*/
app.post("/signup", async (req, res) => {
  try {
    const { role, name, email, password } = req.body;

    const cleanEmail = email.trim().toLowerCase();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      role,
      name,
      email: cleanEmail,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(400).json({ error: "Email already exists or invalid data" });
  }
});

/*Login*/
app.post("/login", async (req, res) => {
  const { role, email, password } = req.body;

  const cleanEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: cleanEmail, role });

  if (!user) return res.status(400).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

  res.json({ message: "Login successful", user });
});

/*Questions*/
app.post("/questions", async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/questions/:id", async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: "Question deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete question" });
  }
});

/*Exams*/
const generateExamCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

app.post("/start-exam", async (req, res) => {
  try {
    const { title, questions, timeLimit, createdBy } = req.body;

    if (!title || !questions?.length || !timeLimit) {
      return res.status(400).json({ error: "Missing exam data" });
    }

    const exam = new Exam({
      title,
      questions,
      timeLimit,
      examCode: generateExamCode(),
      createdBy: createdBy.trim().toLowerCase(),
      status: "started",
    });

    await exam.save();

    res.status(201).json({ examCode: exam.examCode, exam });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*Join exam*/
app.get("/join-exam/:code", async (req, res) => {
  try {
    const examCode = req.params.code.trim();
    const studentEmail = req.query.email?.trim().toLowerCase();

    if (!studentEmail) {
      return res.status(400).json({ error: "Student email required" });
    }

    const exam = await Exam.findOne({
      examCode,
      status: "started",
    }).populate("questions");

    if (!exam) { 
      return res.status(404).json({ error: "Invalid or expired exam code" });
    }

    const attempted = await Result.findOne({
      examId: exam._id,
      studentEmail,
    });

    if (attempted) {
      return res.status(403).json({
        error: "You have already attempted this exam",
      });
    }

    res.json({ exam });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/*Submit exam*/
app.post("/submit-exam", async (req, res) => {
  try {
    const { examId, studentEmail, answers } = req.body;

    const cleanEmail = studentEmail.trim().toLowerCase();

    const exam = await Exam.findById(examId).populate("questions");
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    if (exam.status === "ended") {
      return res.status(403).json({ error: "Exam has ended" });
    }

    const already = await Result.findOne({
      examId,
      studentEmail: cleanEmail,
    });

    if (already) {
      return res.status(403).json({ error: "Already submitted" });
    }

    let mcqScore = 0;
    let totalMarks = 0;

    exam.questions.forEach((q) => {
      if (q.type === "mcq") {
        totalMarks += 1;
        if (answers[q._id] == q.correctOption) mcqScore += 1;
      }
    });

    const result = new Result({
      examId,
      studentEmail: cleanEmail,
      answers,
      mcqScore,
      totalMarks,
      finalScore: mcqScore,
    });

    await result.save();

    res.json({ mcqScore, totalMarks });
  } catch {
    res.status(500).json({ error: "Failed to submit exam" });
  }
});

/*Results*/
app.get("/results/:examId", async (req, res) => {
  const results = await Result.find({ examId: req.params.examId });
  res.json({ results });
});

app.get("/result/:resultId", async (req, res) => {
  const result = await Result.findById(req.params.resultId).populate({
    path: "examId",
    populate: { path: "questions" },
  });

  if (!result) return res.status(404).json({ error: "Not found" });

  res.json({ result });
});

app.post("/grade-result", async (req, res) => {
  const { resultId, longMarks } = req.body;

  const result = await Result.findById(resultId);
  if (!result) return res.status(404).json({ error: "Not found" });

  result.longAnswerMarks = Number(longMarks || 0);
  result.finalScore = (result.mcqScore || 0) + result.longAnswerMarks;

  await result.save();

  const updated = await Result.findById(resultId).populate({
    path: "examId",
    populate: { path: "questions" },
  });

  res.json({ result: updated });
});

/*Teacher exams*/
app.get("/teacher-exams/:email", async (req, res) => {
  try {
    const emailRaw = req.params.email.trim();
    const emailEscaped = emailRaw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const exams = await Exam.find({
      createdBy: { $regex: `^${emailEscaped}$`, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .populate("questions");

    console.log(`Found ${exams.length} exams for teacher '${emailRaw}'`);
    res.json({ exams });
  } catch (err) {
    console.error("Error fetching teacher exams:", err);
    res.status(500).json({ error: "Failed to fetch exams" });
  }
});

/*end exam*/
app.post("/end-exam", async (req, res) => {
  const { examId } = req.body;

  const exam = await Exam.findById(examId);
  if (!exam) return res.status(404).json({ error: "Exam not found" });

  exam.status = "ended";
  await exam.save();

  res.json({ message: "Exam ended successfully" });
});

/*students result*/
app.get("/student-results/:email", async (req, res) => {
  try {
    const emailRaw = req.params.email.trim();
    const emailEscaped = emailRaw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const results = await Result.find({
      studentEmail: { $regex: `^${emailEscaped}$`, $options: "i" },
    })
      .populate("examId")
      .sort({ createdAt: -1 });

    console.log(`Found ${results.length} results for student '${emailRaw}'`);
    res.json({ results });
  } catch (err) {
    console.error("Error fetching student results:", err);
    res.status(500).json({ error: "Failed to fetch student results" });
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
