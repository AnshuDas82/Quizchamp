import React, { useEffect, useState } from "react";
import axios from "axios";

function StudentDashboard() {
  const studentEmail = localStorage.getItem("email")?.trim().toLowerCase();

  const [examCode, setExamCode] = useState("");
  const [examData, setExamData] = useState(null);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [myResults, setMyResults] = useState([]);

  /*fetching of results*/
  const fetchMyResults = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/student-results/${studentEmail}`,
      );
      setMyResults(res.data.results || []);
    } catch (err) {
      console.error("Failed to fetch results");
    }
  };

  useEffect(() => {
    if (studentEmail) fetchMyResults();
  }, []);

  /*to join exam logic*/
  const joinExam = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/join-exam/${examCode}?email=${studentEmail}`,
      );

      setExamData(res.data.exam);
      setTimeLeft(res.data.exam.timeLimit * 60);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to join exam");
    }
  };

  /*timer for exzam*/
  useEffect(() => {
    if (!started) return;

    if (timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [started, timeLeft]);

  const formatTime = () => {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  /*code to submit exam*/
  const submitExam = async () => {
    if (!examData) return;
    if (started === false) return;

    try {
      const res = await axios.post("http://localhost:5000/submit-exam", {
        examId: examData._id,
        studentEmail,
        answers,
      });

      alert(
        `Exam Submitted!\nScore: ${res.data.mcqScore}/${res.data.totalMarks}`,
      );

      setStarted(false);
      setExamData(null);
      setAnswers({});
      fetchMyResults();
    } catch (err) {
      alert(err.response?.data?.error || "Submission failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-linear-to-r from-purple-600 to-fuchsia-600 py-6 text-center">
        <h1 className="text-3xl font-bold text-white">
          Welcome to Student’s Dashboard
        </h1>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/*here is the code to join the exams*/}
        {!examData && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-purple-600 mb-6">
              To join Exam
            </h2>

            <div className="flex flex-col items-center">
              <input
                value={examCode}
                onChange={(e) => setExamCode(e.target.value)}
                placeholder="Enter the 6-digit code"
                className="w-2/3 p-4 rounded-full bg-purple-200 text-center text-lg mb-6 outline-none"
              />

              <button
                onClick={joinExam}
                className="bg-linear-to-r from-purple-600 to-fuchsia-600 text-white px-8 py-3 rounded-full text-lg hover:opacity-90 transition"
              >
                Join Exam
              </button>

              {error && <p className="text-red-600 mt-4">{error}</p>}
            </div>
          </div>
        )}

        {/*details of exam before the start*/}
        {examData && !started && (
          <div className="bg-linear-to-r from-purple-600 to-fuchsia-600 text-white rounded-3xl p-10 text-center mb-10">
            <h2 className="text-2xl mb-4">{examData.title}</h2>
            <p className="text-lg">Time given - {examData.timeLimit} Minutes</p>
            <p className="text-lg">
              Total Questions - {examData.questions.length}
            </p>

            <button
              onClick={() => setStarted(true)}
              className="mt-8 bg-purple-300 text-white px-6 py-3 rounded-full text-lg hover:bg-purple-400 transition"
            >
              Start Exam
            </button>
          </div>
        )}

        {/*exam question rendering code is here*/}
        {started && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-600">
                {examData.title}
              </h2>
              <p className="text-xl font-semibold text-purple-600">
                Time left :- {formatTime()} minutes
              </p>
            </div>

            {examData.questions.map((q, index) => (
              <div key={q._id} className="mb-8">
                <p className="text-xl font-semibold text-purple-600 mb-3">
                  {index + 1}. {q.questionText}
                </p>

                {q.type === "mcq" ? (
                  <ul className="space-y-3 ml-6">
                    {q.options.map((opt, i) => (
                      <li key={i}>
                        <label className="flex items-center gap-3 text-lg text-purple-600">
                          <input
                            type="radio"
                            name={q._id}
                            onChange={() =>
                              setAnswers((prev) => ({
                                ...prev,
                                [q._id]: i,
                              }))
                            }
                          />
                          {opt}
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <textarea
                    className="w-full p-4 rounded-full bg-purple-200 mt-4 outline-none"
                    placeholder="Write Here"
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [q._id]: e.target.value,
                      }))
                    }
                  />
                )}
              </div>
            ))}

            <div className="text-center">
              <button
                onClick={submitExam}
                className="bg-linear-to-r from-purple-600 to-fuchsia-600 text-white px-8 py-3 rounded-full text-lg"
              >
                Submit Exam
              </button>
            </div>
          </>
        )}

        {/*here is the result of all given exms by student*/}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-purple-600 mb-6">
            My Previous Exams
          </h2>

          {myResults.length === 0 ? (
            <p className="text-gray-600">No exams attempted yet</p>
          ) : (
            <table className="w-full text-center border">
              <thead className="bg-linear-to-r from-purple-600 to-fuchsia-600 text-white">
                <tr>
                  <th className="p-3">Exam Name</th>
                  <th className="p-3">MCQ Score</th>
                  <th className="p-3">Final Score</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {myResults.map((r) => (
                  <tr key={r._id} className="bg-purple-200">
                    <td className="p-3">{r.examId?.title}</td>
                    <td className="p-3">
                      {r.mcqScore}/{r.totalMarks}
                    </td>
                    <td className="p-3">{r.finalScore ?? r.mcqScore}</td>
                    <td className="p-3">
                      {r.longAnswerMarks !== undefined ? "Checked" : "Pending"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
