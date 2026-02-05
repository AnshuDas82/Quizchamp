import React, { useEffect, useState } from "react";
import axios from "axios";

function TeacherResults({ examId }) {
  const [results, setResults] = useState([]);
  const [selectedResultId, setSelectedResultId] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [longMarks, setLongMarks] = useState("");

  const fetchResults = () => {
    if (!examId) return;
    axios
      .get(`http://localhost:5000/results/${examId}`)
      .then((res) => setResults(res.data.results))
      .catch(() => console.error("Failed to fetch results"));
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, [examId]);

  const openSubmission = async (resultId) => {
    try {
      setSelectedResultId(resultId);
      const res = await axios.get(
        `http://localhost:5000/result/${resultId}`
      );
      setSubmission(res.data.result);
      setLongMarks(res.data.result?.longAnswerMarks ?? "");
    } catch {
      alert("Failed to load submission");
    }
  };

  const gradeSubmission = async () => {
    try {
      if (!selectedResultId) return;

      const res = await axios.post(
        "http://localhost:5000/grade-result",
        {
          resultId: selectedResultId,
          longMarks: Number(longMarks || 0),
        }
      );

      alert("Marks saved!");

      setSubmission((prev) => ({
        ...prev,
        ...res.data.result,
        examId: prev.examId,
      }));

      fetchResults();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save marks");
    }
  };

  const questions = submission?.examId?.questions || [];

  return (
    <div className="mt-8">

      {/* this is the table section */}
      <div className="bg-white rounded-2xl shadow-xl p-6">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-700">
            Exam Submissions
          </h2>

          <button
            onClick={fetchResults}
            className="bg-linear-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg"
          >
            Refresh
          </button>
        </div>

        {results.length === 0 ? (
          <p className="text-gray-500">No submissions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-linear-to-r from-purple-600 to-pink-600 text-white">
                  <th className="p-3">Student</th>
                  <th className="p-3">MCQ Score</th>
                  <th className="p-3">Final Score</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr
                    key={r._id}
                    className="border-b hover:bg-purple-50"
                  >
                    <td className="p-3">{r.studentEmail}</td>

                    <td className="p-3">
                      {r.mcqScore ?? r.score}/{r.totalMarks}
                    </td>

                    <td className="p-3">
                      {r.finalScore ?? r.score}
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => openSubmission(r._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                      >
                        View Submission
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* here is the submission details section*/}
      {submission && (
        <div className="mt-8 bg-linear-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">

          <h3 className="text-xl font-bold mb-6">
            Submission: {submission.studentEmail}
          </h3>

          {/*questions*/}
          <div className="space-y-6">

            {questions.map((q, index) => {
              const studentAns = submission.answers?.[q._id];

              return (
                <div
                  key={q._id}
                  className="bg-white text-black rounded-xl p-5 shadow-md"
                >
                  <p className="font-semibold text-purple-700 mb-3">
                    {index + 1}. {q.questionText}
                  </p>

                  {q.type === "mcq" ? (
                    <>
                      <p>
                        <span className="font-semibold">
                          Student Answer:
                        </span>{" "}
                        {studentAns !== undefined
                          ? q.options?.[studentAns]
                          : "Not Answered"}
                      </p>

                      <p className="text-green-600 font-semibold">
                        Correct Answer:{" "}
                        {q.options?.[q.correctOption]}
                      </p>
                    </>
                  ) : (
                    <p>
                      <span className="font-semibold">
                        Student Answer:
                      </span>{" "}
                      {studentAns || "Not Answered"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/*this part is for mannual marking*/}
          <div className="mt-8 bg-white text-black rounded-xl p-6 shadow-md">

            <label className="block font-semibold mb-2 text-purple-700">
              Marks for Long Answers (Manual)
            </label>

            <input
              type="number"
              className="border-2 border-purple-300 rounded-lg p-2 w-full mb-4 focus:outline-none focus:border-purple-600"
              value={longMarks}
              onChange={(e) => setLongMarks(e.target.value)}
              placeholder="Enter marks"
            />

            <div className="flex gap-4">
              <button
                onClick={gradeSubmission}
                className="bg-linear-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-lg"
              >
                Save Marks
              </button>

              <button
                onClick={() => {
                  setSubmission(null);
                  setSelectedResultId(null);
                  setLongMarks("");
                }}
                className="bg-gray-600 text-white px-5 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default TeacherResults;
