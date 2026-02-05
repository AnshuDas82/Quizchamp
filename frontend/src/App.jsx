import AuthPage from "./components/Authpage.jsx"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentDashboard from "./components/Studentdashboard.jsx";
import TeacherDashboard from "./components/Teacherdashboard.jsx";
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
