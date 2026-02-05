import React, { useEffect, useState } from "react";
import axios from "axios";
import TeacherResults from "./TeacherResults";

function TeacherDashboard() {
  const teacherEmail = localStorage.getItem("email")?.trim().toLowerCase();

  const [questions, setQuestions] = useState([]);
  const [type, setType] = useState("mcq");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(null);

  const [examTitle, setExamTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState("");

  const [previousExams, setPreviousExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    fetchPreviousExams();
  }, []);

  const fetchPreviousExams = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/teacher-exams/${teacherEmail}`
      );
      setPreviousExams(res.data.exams || []);
    } catch (err) {
      console.error("Failed to fetch exams");
    }
  };

  const addQuestion = async () => {
    if (!questionText.trim()) return;

    if (type === "mcq" && correctOption === null) {
      alert("Select correct option");
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
        : { type, questionText, createdBy: teacherEmail };

    try {
      const res = await axios.post(
        "http://localhost:5000/questions",
        payload
      );

      setQuestions((prev) => [...prev, res.data]);
      setQuestionText("");
      setOptions(["", "", "", ""]);
      setCorrectOption(null);
    } catch {
      alert("Failed to save question");
    }
  };

  const removeQuestion = (questionId) => {
    setQuestions((prev) =>
      prev.filter((q) => q._id !== questionId)
    );
  };

  const startExam = async () => {
    if (!examTitle || !timeLimit || questions.length === 0) {
      alert("Add title, time & questions");
      return;
    }

    try {
      const payload = {
        title: examTitle,
        questions: questions.map((q) => q._id),
        timeLimit: Number(timeLimit),
        createdBy: teacherEmail,
      };

      await axios.post("http://localhost:5000/start-exam", payload);

      alert("Exam started successfully!");
      setExamTitle("");
      setTimeLimit("");
      setQuestions([]);
      fetchPreviousExams();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to start exam");
    }
  };

  const endExam = async () => {
    try {
      await axios.post("http://localhost:5000/end-exam", {
        examId: selectedExam._id,
      });

      alert("Exam ended");
      setSelectedExam((prev) => ({ ...prev, status: "ended" }));
      fetchPreviousExams();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to end exam");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-linear-to-r from-purple-700 to-pink-600 text-white py-6 text-center text-3xl font-bold">
        Welcome to Teacher’s Dashboard
      </div>

      <div className="max-w-5xl mx-auto p-6">

        {/*here is the code to make questions*/}
        <h2 className="text-3xl font-bold text-purple-700 mb-6">
          Make Question
        </h2>

        <div className="bg-purple-200 p-6 rounded-lg shadow-md">

          <select
            className="w-full p-3 mb-4 rounded bg-purple-300 text-white font-semibold"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="mcq">MCQ</option>
            <option value="long">Long Answer</option>
          </select>

          <input
            className="w-full p-3 mb-4 rounded bg-purple-300 text-white placeholder-white"
            placeholder="Enter your question"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />

          {type === "mcq" &&
            options.map((opt, i) => (
              <div key={i} className="flex items-center gap-3 mb-2">
                <input
                  type="radio"
                  checked={correctOption === i}
                  onChange={() => setCorrectOption(i)}
                />
                <input
                  className="w-full p-2 rounded bg-purple-300 text-white placeholder-white"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const arr = [...options];
                    arr[i] = e.target.value;
                    setOptions(arr);
                  }}
                />
              </div>
            ))}

          <button
            onClick={addQuestion}
            className="mt-4 px-6 py-3 bg-linear-to-r from-purple-700 to-pink-600 text-white rounded-full font-semibold"
          >
            Save Question
          </button>
        </div>

        {/*here is the preview of the saved questions*/}
        <h3 className="text-2xl font-bold text-purple-700 mt-10 mb-4">
          Saved Questions
        </h3>

        {questions.map((q, i) => (
          <div
            key={q._id}
            className="bg-purple-100 p-4 rounded-lg mb-4 flex justify-between"
          >
            <div>
              <p className="font-semibold text-purple-800">
                {i + 1}. {q.questionText}
              </p>

              {q.type === "mcq" &&
                q.options.map((opt, index) => (
                  <p
                    key={index}
                    className={
                      index === q.correctOption
                        ? "text-green-600 font-semibold"
                        : ""
                    }
                  >
                    • {opt}
                  </p>
                ))}
            </div>

            <button
              onClick={() => removeQuestion(q._id)}
              className="bg-red-500 text-white px-4 py-1 rounded-full h-fit"
            >
              Remove
            </button>
          </div>
        ))}

        {/*code to start exam*/}
        <div className="mt-10 bg-purple-200 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold text-purple-800 mb-4">
            Start Exam
          </h3>

          <input
            className="w-full p-3 mb-3 rounded bg-purple-300 text-white placeholder-white"
            placeholder="Exam Title"
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
          />

          <input
            type="number"
            className="w-full p-3 mb-3 rounded bg-purple-300 text-white placeholder-white"
            placeholder="Time (minutes)"
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value)}
          />

          <button
            onClick={startExam}
            className="px-6 py-3 bg-linear-to-r from-purple-700 to-pink-600 text-white rounded-full font-semibold"
          >
            Start Exam
          </button>
        </div>

        {/*previous exam section is here*/}
        <div className="mt-10">
          <h3 className="text-2xl font-bold text-purple-700 mb-4">
            Previous Exams
          </h3>

          {previousExams.map((exam) => (
            <div
              key={exam._id}
              className="bg-purple-100 p-4 rounded-lg mb-3 cursor-pointer"
              onClick={() => setSelectedExam(exam)}
            >
              <p className="font-semibold text-purple-800">
                {exam.title}
              </p>
              <p>Code: {exam.examCode}</p>
              <p>Status: {exam.status}</p>
            </div>
          ))}
        </div>

        {/*this part is to open details of the selected exams*/}
        {selectedExam && (
          <div className="mt-8 bg-purple-200 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-purple-800">
                {selectedExam.title}
              </h3>

              {selectedExam.status === "started" && (
                <button
                  onClick={endExam}
                  className="bg-red-600 text-white px-4 py-2 rounded-full"
                >
                  End Exam
                </button>
              )}
            </div>

            <TeacherResults examId={selectedExam._id} />
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
