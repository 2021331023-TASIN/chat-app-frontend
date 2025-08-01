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
            default: '#ece5dd',
            paper: '#ffffff',
        },
    },
});

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // ✅ UPDATED: The request now uses the correct URL: /api/users/register
            const response = await axios.post(`${API_URL}/users/register`, { username, email, password });
            toast.success(response.data.message);
            navigate('/verify-otp');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
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
                            Create a New Account
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Fill in your details to get started
                        </Typography>
                    </Box>
                    <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
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
                            autoComplete="new-password"
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
                            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
                        </Button>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        Already have an account? <Link to="/login" style={{ color: whatsAppAuthTheme.palette.primary.main, textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
                    </Typography>
                </Paper>
            </Box>
        </ThemeProvider>
    );
};

export default Register;