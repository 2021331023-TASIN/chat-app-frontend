import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Paper, TextField, Typography, Container, CircularProgress, Link as MuiLink } from '@mui/material';
import { toast } from 'react-toastify';
import axios from '../utils/AxiosInstance'; // Ensure this path is correct!

const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Make the API call to your backend for user registration
            await axios.post('/users/register', form);
            toast.success('Registration successful! Please check your email for OTP.');

            // ✅ THIS IS THE FIX: Navigate to the OTP verification page
            // and pass the email state to the next component
            navigate('/verify-otp', { state: { email: form.email } });

        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper elevation={3} style={{ padding: '30px', width: '100%', borderRadius: '8px' }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Sign Up
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        name="username"
                        label="Username"
                        fullWidth
                        margin="normal"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        name="email"
                        label="Email"
                        type="email"
                        fullWidth
                        margin="normal"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        name="password"
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loading}
                        style={{ marginTop: '20px' }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Sign Up'}
                    </Button>
                </form>
                <Typography variant="body2" align="center" style={{ marginTop: '10px' }}>
                    Already have an account? <MuiLink href="/login">Login</MuiLink>
                </Typography>
            </Paper>
        </Container>
    );
};

export default Register;
