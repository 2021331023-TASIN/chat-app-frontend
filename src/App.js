import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme } from './theme'; // Import the new theme

// Import your components
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { ToastContainer } from 'react-toastify';

function App() {
  // You can add state and a toggle function here to switch between lightTheme and darkTheme
  return (
    <ThemeProvider theme={lightTheme}> 
      <CssBaseline /> {/* Add CssBaseline for consistent styling */}
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </Router>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </ThemeProvider>
  );
}

export default App;