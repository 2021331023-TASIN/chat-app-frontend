import { useState } from 'react';
import { Button, Paper, TextField, Typography, Container, CircularProgress, Box } from '@mui/material';
import axios from '../utils/AxiosInstance'; // <--- CHANGE THISimport { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Don't forget this for styling!
const LoginForm = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/users/login', form);
            toast.success(response.data.message);

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(errorMessage);

            // === NEW CODE FOR LOGINFORM ===
            if (error.response && error.response.status === 403 && error.response.data.message.includes("Please verify your email address")) {
                toast.info("Redirecting to verification page...");
                navigate(`/verify?email=${encodeURIComponent(form.email)}`); // Redirect and pass email as query param
            }
            // ===============================

        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper elevation={3} style={{ padding: '30px', width: '100%' }}>
                <Typography variant="h5" component="h2" gutterBottom align="center">
                    Login to ChatApp
                </Typography>

                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                        {loading ? <CircularProgress size={24} /> : 'Login'}
                    </Button>
                </form>
                <Box mt={2} textAlign="center">
                    <Typography variant="body2">
                        Don't have an account? <Link to="/">Sign Up</Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default LoginForm;