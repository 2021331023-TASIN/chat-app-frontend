import { useState } from 'react';
import { Button, Paper, TextField, Typography, Container, CircularProgress, Box } from '@mui/material';
import axios from '../utils/AxiosInstance'; // <--- CHANGE THISimport { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Don't forget this for styling!

const SignUpForm = () => {
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/users/register', form);
            toast.success(response.data.message);
            // Pass the email to the verification page via state
            navigate('/verify', { state: { email: form.email } });
        } catch (error) {
            console.error('Signup error:', error);
            const errorMessage = error.response?.data?.message || 'Something went wrong during registration. Please try again.';
            toast.error(errorMessage);

            // === NEW CODE FOR SIGNUPFORM ===
            if (error.response && error.response.status === 400 && error.response.data.message.includes("User already registered but not verified")) {
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
                    Sign Up To ChatApp
                </Typography>

                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        required
                    />
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
                        {loading ? <CircularProgress size={24} /> : 'Sign Up'}
                    </Button>
                </form>
                <Box mt={2} textAlign="center">
                    <Typography variant="body2">
                        Already have an account? <Link to="/login">Login</Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default SignUpForm;