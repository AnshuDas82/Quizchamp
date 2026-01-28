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
      .catch((err) => console.error("Failed to fetch results", err));
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, [examId]);

  const openSubmission = async (resultId) => {
    try {
      setSelectedResultId(resultId);
      const res = await axios.get(`http://localhost:5000/result/${resultId}`);
      setSubmission(res.data.result);
      setLongMarks(res.data.result?.longAnswerMarks ?? "");
    } catch (err) {
      alert("Failed to load submission details");
    }
  };

  const gradeSubmission = async () => {
  try {
    if (!selectedResultId) return;

    const res = await axios.post("http://localhost:5000/grade-result", {
      resultId: selectedResultId,
      longMarks: Number(longMarks || 0),
    });

    alert("Marks saved!");

    // ✅ keep old populated examId/questions, only update score fields
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


  // ✅ SAFETY: never crash if submission not populated fully
  const questions = submission?.examId?.questions || [];

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold mb-4">Exam Submissions</h2>
        <button
          onClick={fetchResults}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Refresh
        </button>
      </div>

      {/* TABLE */}
      {results.length === 0 ? (
        <p>No submissions yet</p>
      ) : (
        <table className="w-full border mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Student</th>
              <th className="border p-2">MCQ Score</th>
              <th className="border p-2">Final Score</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="border p-2">{r.studentEmail}</td>

                <td className="border p-2 text-center">
                  {r.mcqScore ?? r.score}/{r.totalMarks}
                </td>

                <td className="border p-2 text-center">
                  {r.finalScore ?? r.score}
                </td>

                <td className="border p-2 text-center">
                  <button
                    onClick={() => openSubmission(r._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    View Submission
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* SUBMISSION DETAILS */}
      {submission && (
        <div className="border rounded p-4 bg-gray-50">
          <h3 className="text-lg font-bold mb-2">
            Submission: {submission.studentEmail}
          </h3>

          {/* ✅ if questions not loaded, show message instead of crashing */}
          {questions.length === 0 ? (
            <p className="text-red-600">
              Submission loaded, but questions are not available (populate issue).
            </p>
          ) : (
            questions.map((q, index) => {
              const studentAns = submission.answers?.[q._id];

              return (
                <div key={q._id} className="border p-3 rounded bg-white mb-3">
                  <p className="font-semibold">
                    {index + 1}. {q.questionText}
                  </p>

                  {q.type === "mcq" ? (
                    <div className="mt-2">
                      <p>
                        <b>Student Answer:</b>{" "}
                        {studentAns !== undefined
                          ? q.options?.[studentAns]
                          : "Not Answered"}
                      </p>

                      <p className="text-green-600">
                        <b>Correct Answer:</b> {q.options?.[q.correctOption]}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-gray-700">
                        <b>Student Answer:</b> {studentAns || "Not Answered"}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* MANUAL MARKING */}
          <div className="mt-4">
            <label className="block font-semibold mb-1">
              Marks for Long Answers (Teacher Manual)
            </label>

            <input
              type="number"
              className="border p-2 w-full mb-3"
              value={longMarks}
              onChange={(e) => setLongMarks(e.target.value)}
              placeholder="Enter marks (e.g. 5)"
            />

            <div className="flex gap-3">
              <button
                onClick={gradeSubmission}
                className="bg-purple-600 text-white px-4 py-2 rounded"
              >
                Save Marks
              </button>

              <button
                onClick={() => {
                  setSubmission(null);
                  setSelectedResultId(null);
                  setLongMarks("");
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded"
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
