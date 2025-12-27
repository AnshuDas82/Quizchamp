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
      createdBy,
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

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
