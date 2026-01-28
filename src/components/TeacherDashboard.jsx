import React, { useEffect, useState } from "react";
import axios from "axios";
import TeacherResults from "./TeacherResults";

function TeacherDashboard() {
  const [questions, setQuestions] = useState([]);
  const [type, setType] = useState("mcq");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(null);
  const [examTitle, setExamTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [examPreview, setExamPreview] = useState(null);

  // ✅ Task #1: previous exams
  const [previousExams, setPreviousExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);

  const teacherEmail = localStorage.getItem("email");

  // ✅ fetch teacher previous exams
  const fetchPreviousExams = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/teacher-exams/${teacherEmail}`
      );
      setPreviousExams(res.data.exams || []);
    } catch (err) {
      console.error("Failed to load previous exams", err);
    }
  };

  useEffect(() => {
    fetchPreviousExams();
  }, []);

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

      const exam = res.data.exam || res.data;

      setExamPreview({
        title: exam.title,
        timeLimit: exam.timeLimit,
        totalQuestions: questions.length,
        createdBy: exam.createdBy,
        examCode: res.data.examCode || exam.examCode,
        examId: exam._id,
      });

      alert("Exam started successfully!");

      // ✅ refresh previous exams list after starting a new exam
      fetchPreviousExams();
    } catch (err) {
      alert("Failed to start exam");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* CREATE QUESTIONS */}
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

      {/* START EXAM */}
      <div className="bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">Start Exam</h1>

          <input
            className="border p-2 w-full mb-3"
            placeholder="Exam Title"
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
          />

          <input
            type="number"
            className="border p-2 w-full mb-3"
            placeholder="Time limit (minutes)"
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
          />

          <button
            onClick={startExam}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Start Exam
          </button>
        </div>
      </div>

      {/* CURRENT EXAM PREVIEW */}
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

          <div className="mt-6">
            <TeacherResults examId={examPreview.examId} />
          </div>
        </div>
      )}

      {/* ✅ PREVIOUS EXAMS (Task #1) */}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Previous Exams</h2>
          <button
            onClick={fetchPreviousExams}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Refresh
          </button>
        </div>

        {previousExams.length === 0 ? (
          <p className="text-gray-600">No exams created yet</p>
        ) : (
          <div className="space-y-3">
            {previousExams.map((exam) => (
              <div
                key={exam._id}
                className="border p-4 rounded bg-gray-50 cursor-pointer hover:bg-gray-100"
                onClick={() => setSelectedExam(exam)}
              >
                <p className="font-semibold text-lg">{exam.title}</p>
                <p className="text-sm text-gray-700">
                  Exam Code: <b>{exam.examCode}</b>
                </p>
                <p className="text-sm text-gray-700">
                  Time Limit: <b>{exam.timeLimit} min</b>
                </p>
                <p className="text-sm text-gray-700">
                  Status:{" "}
                  <b
                    className={
                      exam.status === "ended"
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    {exam.status}
                  </b>
                </p>
                <p className="text-sm text-gray-700">
                  Questions: <b>{exam.questions?.length || 0}</b>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Selected Exam Details + Results */}
      {selectedExam && (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow mt-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">Selected Exam</h2>

            <button
              onClick={() => setSelectedExam(null)}
              className="bg-gray-600 text-white px-3 py-1 rounded"
            >
              Close
            </button>
          </div>

          <p>
            <b>Title:</b> {selectedExam.title}
          </p>
          <p>
            <b>Exam Code:</b> {selectedExam.examCode}
          </p>
          <p>
            <b>Status:</b> {selectedExam.status}
          </p>
          <p>
            <b>Time Limit:</b> {selectedExam.timeLimit} minutes
          </p>

          <div className="mt-6">
            <TeacherResults examId={selectedExam._id} />
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherDashboard;
