import React, { useState, useEffect } from 'react';
import { Button, Paper, TextField, Typography, Container, CircularProgress, Box, Link as MuiLink } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/AxiosInstance'; // Ensure this path is correct!

const VerifyOtpForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        let userEmail = location.state?.email;
        if (!userEmail) {
            const params = new URLSearchParams(location.search);
            userEmail = params.get('email');
        }

        if (userEmail) {
            setEmail(userEmail);
        } else {
            toast.error('No email provided for verification. Please register or login.');
            navigate('/');
        }
    }, [location.state, location.search, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!email) {
            toast.error("Email is missing. Please go back to sign up or login.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('/users/verify-otp', { email, otp });
            toast.success(response.data.message);
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            navigate('/dashboard');
        } catch (error) {
            console.error('OTP verification error:', error);
            const errorMessage = error.response?.data?.message || 'OTP verification failed. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        if (!email) {
            toast.error("Email is missing. Cannot resend OTP.");
            setLoading(false);
            return;
        }
        try {
            const response = await axios.post('/users/resend-otp', { email });
            toast.success(response.data.message);
        } catch (error) {
            console.error('Resend OTP error:', error);
            const errorMessage = error.response?.data?.message || "Failed to resend OTP. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper elevation={3} style={{ padding: '30px', width: '100%', borderRadius: '8px' }}>
                <Typography variant="h5" component="h2" gutterBottom align="center">
                    Verify Your Email
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom align="center">
                    An OTP has been sent to your email: <strong>{email}</strong>
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Enter OTP"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
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
                        {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
                    </Button>
                </form>
                <Box mt={2} textAlign="center">
                    <Typography variant="body2">
                        Didn't receive OTP?
                        <MuiLink component="button" onClick={handleResendOtp} disabled={loading} style={{ marginLeft: '4px' }}>
                            Resend OTP
                        </MuiLink>
                    </Typography>
                    <Typography variant="body2">
                        Already verified? <MuiLink href="/login">Login</MuiLink>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default VerifyOtpForm;
