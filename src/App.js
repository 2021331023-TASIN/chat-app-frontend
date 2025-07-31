import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Don't forget to import CSS for toastify

import SignUpForm from './components/SignUpForm';
import VerifyOtpForm from './components/VerifyOtpForm';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard'; // Your protected page after login

function App() {
  return (
    <Router>
      {/* Toast container for notifications */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      <Routes>
        <Route path="/" element={<SignUpForm />} /> {/* Default route (Sign Up) */}
        <Route path="/verify" element={<VerifyOtpForm />} /> {/* OTP verification route */}
        <Route path="/login" element={<LoginForm />} /> {/* Login route */}
        <Route path="/dashboard" element={<Dashboard />} /> {/* Protected dashboard/chat page */}
        {/* You can add more routes here for other parts of your application */}
      </Routes>
    </Router>
  );
}

export default App;