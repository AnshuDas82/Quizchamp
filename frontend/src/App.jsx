import AuthPage from "./components/Authpage.jsx"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentDashboard from "./components/StudentDashboard.jsx";
import TeacherDashboard from "./components/TeacherDashboard.jsx";
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}   

export default App
// mongodb+srv://kranshu983_db_user:YhMqvZ2XcgF5OqJO@cluster0.qcjaijg.mongodb.net/