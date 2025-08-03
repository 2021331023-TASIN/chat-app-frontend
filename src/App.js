import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme } from './theme';
import { ToastContainer } from 'react-toastify';

// Import your components
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// You need to import your verification component here
import VerifyOtpForm from './components/VerifyOtpForm'; 

function App() {
  return (
    <ThemeProvider theme={lightTheme}> 
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* This is the missing route */}
          <Route path="/verify-otp" element={<VerifyOtpForm />} />
          
          <Route path="/" element={<Login />} />
        </Routes>
      </Router>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </ThemeProvider>
  );
}

export default App;