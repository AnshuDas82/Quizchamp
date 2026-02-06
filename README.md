# QuizChamp – Online Exam Management System

QuizChamp is a full-stack web application that allows teachers to create, manage, and evaluate online exams, while students can securely join exams using a unique code and view their results.

Built with:

⚛️ React.js (Frontend)

🚀 Node.js + Express.js (Backend)

🍃 MongoDB + Mongoose (Database)

🎨 Tailwind CSS (UI Design)

# Features
👩‍🏫 Teacher Features

- Create MCQ and Long Answer questions

- Start exams with:

- Custom title

- Time limit

- Auto-generated 6-digit exam code

- View all previously created exams

- End exam manually

- View student submissions

- Auto-evaluation for MCQs

- Manual grading for long answers

- Real-time result updates

👨‍🎓 Student Features

- Join exam using 6-digit code

- Timer-based exam session

- Auto-submit when time runs out ⏱

- Prevent multiple attempts

- View previous exam attempts

- See MCQ score and final graded score

# Security Features

- Email-based login system

- Role-based authentication (Student / Teacher)

- Prevent multiple submissions

- Block re-attempt after submission

- Prevent submission after exam ends

- Server-side validation for all exam actions

# 🧠 How It Works

1. Teacher creates questions.

2. Teacher starts an exam.

3. System generates a unique 6-digit exam code.

4. Students join using that code.

5. Timer starts when student begins exam.

6. Exam auto-submits when timer ends.

7. MCQs auto-graded.

8. Teacher manually grades long answers.

9. Final score is calculated and displayed.

# 📁 Project Structure
```
QuizChamp/
│
├── frontend/
│ ├── AuthPage.jsx
│ ├── TeacherDashboard.jsx
│ ├── TeacherResults.jsx
│ ├── StudentDashboard.jsx
│ └── ...
│
├── backend/
│ ├── server.js
│ ├── models/
│ │ ├── Exam.js
│ │ ├── Result.js
│ │ └── ...
│ └── question.js
│
└── README.md
```

# ⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/your-username/quizchamp.git
cd quizchamp

2️⃣ Backend Setup
cd backend
npm install

Start MongoDB locally.

Then run:

node server.js

Server runs on:

http://localhost:5000

3️⃣ Frontend Setup
cd frontend
npm install
npm start

Frontend runs on:

http://localhost:3000

🗄 Database Collections

users

questions

exams

results

# 🏆 Exam Flow Logic
- MCQ Scoring

- Each MCQ = 1 mark
- Automatically graded on submission.

- Long Answer Scoring

- Teacher manually assigns marks.

- Final Score = MCQ Score + Long Answer Marks

# 📌 Important API Endpoints
Method Endpoint Description
POST /signup Register user
POST /login Login user
POST /questions Create question
POST /start-exam Start new exam
GET /join-exam/:code Join exam
POST /submit-exam Submit exam
GET /results/:examId Get exam results
POST /grade-result Grade long answers
POST /end-exam End exam
GET /teacher-exams/:email Teacher previous exams
GET /student-results/:email Student previous attempts

# 👨‍💻 Developed By
```
Anshu Kumar Das
Computer Science & Engineering Student
Full Stack Developer
```
