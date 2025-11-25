import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ExamProvider, useExam } from './context/ExamContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import ExamInterface from './pages/ExamInterface';
import Result from './pages/Result';

const ProtectedRoute = ({ children }) => {
  const { isExamActive, questions } = useExam();
  // Allow access if exam is active OR if questions are loaded (for Result page access after submit)
  // Actually Result page might be accessed after isExamActive becomes false.
  // So we check if questions exist.
  if (questions.length === 0) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <ExamProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/exam"
            element={
              <ProtectedRoute>
                <ExamInterface />
              </ProtectedRoute>
            }
          />
          <Route
            path="/result"
            element={
              <ProtectedRoute>
                <Result />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer position="bottom-right" theme="colored" />
      </Router>
    </ExamProvider>
  );
}

export default App;
