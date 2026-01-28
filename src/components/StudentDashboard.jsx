import React, { useEffect, useState } from "react";
import axios from "axios";

function StudentDashboard() {
  const [examCode, setExamCode] = useState("");
  const [examData, setExamData] = useState(null);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);

  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  const joinExam = async () => {
    if (examCode.length !== 6) {
      setError("Please enter a valid 6-digit exam code");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/join-exam/${examCode}`
      );

      setExamData(res.data.exam);
      setTimeLeft(res.data.exam.timeLimit * 60); // minutes → seconds
      setError("");
    } catch (err) {
      setExamData(null);
      setError("Invalid or expired exam code");
    }
  };

  // ⏱ TIMER
  useEffect(() => {
    if (!started || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          submitExam(); // auto-submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, timeLeft]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const submitExam = async () => {
  try {
    const payload = {
      examId: examData._id,
      studentEmail: "student@gmail.com", // later from auth
      answers,
    };

    const res = await axios.post(
      "http://localhost:5000/submit-exam",
      payload
    );

    alert(
      `Exam Submitted!\nScore: ${res.data.score}/${res.data.totalMarks}`
    );

    setStarted(false);
  } catch (err) {
    alert("Failed to submit exam");
  }
};


  const endExam = () => {
    submitExam();
  };

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">

        {!examData ? (
          <>
            <h1 className="text-2xl font-bold mb-4 text-center">
              Student Dashboard
            </h1>

            <input
              type="text"
              placeholder="Enter 6-digit Exam Code"
              value={examCode}
              onChange={(e) => setExamCode(e.target.value)}
              className="border p-2 w-full mb-3 text-center tracking-widest"
              maxLength={6}
            />

            <button
              onClick={joinExam}
              className="bg-blue-600 text-white w-full py-2 rounded"
            >
              Join Exam
            </button>

            {error && (
              <p className="text-red-600 text-center mt-3">{error}</p>
            )}
          </>
        ) : !started ? (
          <>
            <h2 className="text-xl font-semibold mb-3">
              {examData.title}
            </h2>

            <p>Total Questions: {examData.questions.length}</p>
            <p>Time Limit: {examData.timeLimit} minutes</p>

            <button
              className="bg-green-600 text-white w-full py-2 rounded mt-4"
              onClick={() => setStarted(true)}
            >
              Start Exam
            </button>
          </>
        ) : (
          <>
            {/* TIMER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Exam in Progress</h2>
              <span className="text-red-600 font-bold text-lg">
                ⏱ {formatTime()}
              </span>
            </div>

            {/* QUESTIONS */}
            {examData.questions.map((q, index) => (
              <div key={q._id} className="border p-4 mb-4 rounded">
                <p className="font-semibold mb-2">
                  {index + 1}. {q.questionText}
                </p>

                {q.type === "mcq" ? (
                  q.options.map((opt, i) => (
                    <label key={i} className="block">
                      <input
                        type="radio"
                        name={q._id}
                        value={i}
                        onChange={() =>
                          handleAnswerChange(q._id, i)
                        }
                      />{" "}
                      {opt}
                    </label>
                  ))
                ) : (
                  <textarea
                    className="border w-full p-2"
                    rows="3"
                    placeholder="Write your answer..."
                    onChange={(e) =>
                      handleAnswerChange(q._id, e.target.value)
                    }
                  />
                )}
              </div>
            ))}

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 mt-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={submitExam}
              >
                Submit Answers
              </button>

              <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={endExam}
              >
                End Exam
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
