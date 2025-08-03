import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles'; // Import createTheme
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import your components
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import VerifyOtpForm from './components/VerifyOtpForm'; 

// Define a simple theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={lightTheme}> 
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* ✅ This is the crucial line that enables the OTP verification page */}
          <Route path="/verify-otp" element={<VerifyOtpForm />} />
          
          <Route path="/" element={<Login />} />
        </Routes>
      </Router>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </ThemeProvider>
  );
}

export default App;
