import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Typography, TextField, Button, CircularProgress, Box, Paper, IconButton } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

// ✅ UPDATED: The API URL now includes the '/api' prefix
const API_URL = 'https://chat-app-backend-0d86.onrender.com/api';

const whatsAppAuthTheme = createTheme({
    palette: {
        primary: {
            main: '#075e54',
        },
        secondary: {
            main: '#25d366',
        },
        background: {
            default: '#ece5dd', // Light gray background
            paper: '#ffffff',  // White paper background for the form
        },
    },
});

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // ✅ UPDATED: The request now uses the correct URL: /api/users/login
            const response = await axios.post(`${API_URL}/users/login`, { email, password });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={whatsAppAuthTheme}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    backgroundColor: 'background.default',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400, textAlign: 'center', borderRadius: 2 }}>
                    <Box sx={{ mb: 3 }}>
                        <IconButton color="primary" sx={{ fontSize: 64, mb: 1 }}>
                            <WhatsAppIcon sx={{ fontSize: 'inherit' }} />
                        </IconButton>
                        <Typography variant="h5" component="h1" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                            Login to Chat App
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Enter your credentials to continue
                        </Typography>
                    </Box>
                    <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.5, backgroundColor: 'secondary.main', '&:hover': { backgroundColor: 'primary.main' } }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Login'}
                        </Button>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Don't have an account? <Link to="/register" style={{ color: whatsAppAuthTheme.palette.primary.main, textDecoration: 'none', fontWeight: 'bold' }}>Sign Up</Link>
                    </Typography>
                </Paper>
            </Box>
        </ThemeProvider>
    );
};

export default Login;