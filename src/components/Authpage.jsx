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

  const navigate = useNavigate(); // ✅ INSIDE component

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await axios.post("http://localhost:5000/login", {
          role,
          email: formData.email,
          password: formData.password,
        });

        alert(res.data.message);
        localStorage.setItem("email", res.data.user.email);
        localStorage.setItem("role", res.data.user.role);
        // ✅ REDIRECT
        if (role === "student") navigate("/student-dashboard");
        else navigate("/teacher-dashboard");

      } else {
        const res = await axios.post("http://localhost:5000/signup", {
          role,
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        alert(res.data.message);
        setIsLogin(true); // switch to login
      }
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div>
      <div className="flex mb-4 w-full justify-center items-center">
        <h1 className="text-7xl font-bold bg-purple-800 text-white">QuizChamp</h1>
      </div>
      {!role ? (
        <>
          <h2>Are you a Student or Teacher?</h2>
          <button onClick={() => setRole("student")}>Student</button>
          <button onClick={() => setRole("teacher")}>Teacher</button>
        </>
      ) : (
        <>
          <h2>{isLogin ? "Login" : "Signup"} as {role}</h2>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit">
              {isLogin ? "Login" : "Signup"}
            </button>
          </form>
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Signup" : "Login"}
            </button>
          </p>
        </>
      )}
    </div>
  );
}

export default AuthPage;
