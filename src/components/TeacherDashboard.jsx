import React, { useState } from "react";
import axios from "axios";

function TeacherDashboard() {
  const [questions, setQuestions] = useState([]);
  const [type, setType] = useState("mcq");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(null);
  const [examTitle, setExamTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [examPreview, setExamPreview] = useState(null);

  const teacherEmail = "teacher@gmail.com"; // later from auth

  const addQuestion = async () => {
    if (!questionText.trim()) return;

    if (type === "mcq" && correctOption === null) {
      alert("Please select the correct option");
      return;
    }

    const payload =
      type === "mcq"
        ? {
            type,
            questionText,
            options,
            correctOption,
            createdBy: teacherEmail,
          }
        : {
            type,
            questionText,
            createdBy: teacherEmail,
          };

    try {
      const res = await axios.post("http://localhost:5000/questions", payload);

      // ✅ SAVE QUESTION WITH _id FROM BACKEND
      setQuestions([...questions, res.data]);

      // reset form
      setQuestionText("");
      setOptions(["", "", "", ""]);
      setCorrectOption(null);
    } catch (err) {
      alert("Failed to save question");
    }
  };

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };
  const startExam = async () => {
    try {
      if (!examTitle || !timeLimit || questions.length === 0) {
        alert("Please add exam title, time limit, and questions");
        return;
      }

      const payload = {
        title: examTitle,
        questions: questions.map((q) => q._id), // IDs only
        timeLimit: Number(timeLimit),
        createdBy: teacherEmail,
      };

      const res = await axios.post("http://localhost:5000/start-exam", payload);

      setExamPreview({
        title: examTitle,
        timeLimit,
        totalQuestions: questions.length,
        createdBy: teacherEmail,
        examCode: res.data.examCode || res.data.exam?.examCode,
      });
      console.log("START EXAM RESPONSE 👉", res.data);

      alert("Exam started successfully!");
    } catch (err) {
      alert("Failed to start exam");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Teacher Dashboard</h1>

        <select
          className="border p-2 w-full mb-4"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="mcq">MCQ</option>
          <option value="long">Long Answer</option>
        </select>

        <input
          className="border p-2 w-full mb-4"
          placeholder="Enter question"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />

        {type === "mcq" &&
          options.map((opt, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                name="correctOption"
                checked={correctOption === index}
                onChange={() => setCorrectOption(index)}
              />
              <input
                className="border p-2 w-full"
                placeholder={`Option ${index + 1}`}
                value={opt}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index] = e.target.value;
                  setOptions(newOptions);
                }}
              />
            </div>
          ))}

        <button
          onClick={addQuestion}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-3"
        >
          Save Question
        </button>

        {/* Preview */}
        <h2 className="text-xl font-semibold mt-6">Preview</h2>

        {questions.map((q, index) => (
          <div key={index} className="border p-4 mt-2 rounded bg-gray-50">
            <p className="font-semibold">
              {index + 1}. {q.questionText}
            </p>

            {q.type === "mcq" && (
              <ul className="ml-5 mt-2">
                {q.options.map((opt, i) => (
                  <li
                    key={i}
                    className={
                      q.correctOption === i
                        ? "text-green-600 font-semibold"
                        : ""
                    }
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={() => deleteQuestion(index)}
              className="text-red-600 mt-2"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <div className="bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">Set Exam</h1>

          {/* EXAM TITLE */}
          <input
            className="border p-2 w-full mb-3"
            placeholder="Exam Title"
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
          />

          {/* TIME LIMIT */}
          <input
            type="number"
            className="border p-2 w-full mb-3"
            placeholder="Time limit (minutes)"
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
          />

          {/* SET EXAM */}
          <button
            onClick={startExam}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Start Exam
          </button>
        </div>
      </div>
      {/* EXAM PREVIEW */}
      {examPreview && (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow mt-6">
          <h2 className="text-xl font-bold mb-3">Exam Started</h2>

          <p>
            <b>Exam Title:</b> {examPreview.title}
          </p>
          <p>
            <b>Time Limit:</b> {examPreview.timeLimit} minutes
          </p>
          <p>
            <b>Total Questions:</b> {examPreview.totalQuestions}
          </p>
          <p>
            <b>Created By:</b> {examPreview.createdBy}
          </p>

          <p className="mt-4 text-lg font-bold text-blue-600">
            Exam Code: {examPreview.examCode}
          </p>

          <p className="text-gray-600">
            Share this code with students to start the exam
          </p>
        </div>
      )}
    </div>
  );
}

export default TeacherDashboard;
