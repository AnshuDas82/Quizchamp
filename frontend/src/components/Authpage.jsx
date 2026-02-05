import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AuthPage() {
  const [role, setRole] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const res = await axios.post("https://quizchamp-backend.onrender.com/login", {
          role,
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem("email", res.data.user.email);
        localStorage.setItem("role", res.data.user.role);

        if (role === "student") navigate("/student-dashboard");
        else navigate("/teacher-dashboard");
      } else {
        const res = await axios.post("https://quizchamp-backend.onrender.com/signup", {
          role,
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        alert(res.data.message);
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      <div className="bg-linear-to-r from-purple-700 to-fuchsia-600 py-8 text-center">
        <h1 className="text-5xl font-bold text-white">Quizchamp</h1>
        <p className="text-purple-100 mt-2 text-lg">
          A great platform to conduct Tests, Exams and Quizzes.
        </p>
      </div>

      {/*this part is for selecting the roles*/}
      {!role ? (
        <div className="flex flex-col items-center justify-center grow">
          <h2 className="text-3xl font-bold text-purple-700 mb-10">
            Are you a Student or Teacher?
          </h2>

          <div className="flex gap-20">
            <button
              onClick={() => setRole("student")}
              className="bg-purple-300 hover:bg-purple-400 text-white text-4xl font-bold px-20 py-6 rounded-full transition duration-300"
            >
              Student
            </button>

            <button
              onClick={() => setRole("teacher")}
              className="bg-purple-300 hover:bg-purple-400 text-white text-4xl font-bold px-20 py-6 rounded-full transition duration-300"
            >
              Teacher
            </button>
          </div>
        </div>
      ) : (
        <div className="flex grow items-center justify-center">
          <div className="bg-linear-to-b from-purple-700 to-fuchsia-600 p-10 rounded-3xl shadow-xl w-100 text-white">

            <h2 className="text-2xl text-center mb-6 font-semibold">
              {isLogin ? "Login" : "Sign-Up"} as {role}
            </h2>
            

            <form onSubmit={handleSubmit} className="space-y-5">

              {!isLogin && (
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-4 rounded-full bg-purple-200 text-purple-900 placeholder-purple-600 outline-none"
                />
              )}

              <input
                type="email"
                name="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-4 rounded-full bg-purple-200 text-purple-900 placeholder-purple-600 outline-none"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-4 rounded-full bg-purple-200 text-purple-900 placeholder-purple-600 outline-none"
              />

              <button
                type="submit"
                className="w-full bg-white text-purple-700 font-bold py-3 rounded-full hover:bg-purple-100 transition"
              >
                {isLogin ? "Login" : "Sign-Up"}
              </button>
            </form>

            <div className="mt-6 text-center text-purple-100">
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}

              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-3 bg-purple-300 text-white px-4 py-2 rounded-full hover:bg-purple-400 transition"
              >
                {isLogin ? "Sign-Up" : "Login"}
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                onClick={() => setRole("")}
                className="text-sm text-purple-200 underline"
              >
                ← Change Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/*code for footer*/}
      <div className="bg-gray-700 text-white text-center py-3 text-sm">
        © copyrighted by Anshu Kumar Das Github-@AnshuDas82
      </div>
    </div>
  );
}

export default AuthPage;
