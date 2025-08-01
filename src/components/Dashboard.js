import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, CircularProgress, Paper, List, ListItem, ListItemText, Divider, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../utils/AxiosInstance';
import { io } from 'socket.io-client';

const BACKEND_SOCKET_URL = 'https://chat-app-backend-0d86.onrender.com';

const Dashboard = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);

    // ====================================================================
    // 1. useEffect for Initial Setup and Socket Connection (Runs only once)
    // ====================================================================
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
            toast.error('You need to log in to access this page.');
            navigate('/login');
            setLoading(false);
            return;
        }

        let newSocket;
        try {
            const parsedUser = JSON.parse(storedUser);
            setCurrentUser(parsedUser);

            newSocket = io(BACKEND_SOCKET_URL);
            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Socket.IO connected!');
                newSocket.emit('userOnline', parsedUser.id);
            });
            
            // This listener is now more robust to prevent duplicates
            newSocket.on('receiveMessage', (message) => {
                console.log('Received message:', message);
                // The backend now sends the full message object, including senderId
                setMessages((prevMessages) => [...prevMessages, message]);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket.IO disconnected!');
            });
            newSocket.on('connect_error', (err) => {
                console.error('Socket.IO connection error:', err.message);
                toast.error('Real-time connection failed.');
            });

            return () => {
                console.log('Cleaning up Socket.IO connection...');
                newSocket.off('receiveMessage');
                newSocket.disconnect();
            };

        } catch (e) {
            console.error("Failed to parse user from localStorage or connect socket", e);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.error('User data corrupted. Please log in again.');
            navigate('/login');
        } finally {
            setLoading(false);
        }

    }, [navigate]);

    // ==================================================================
    // 2. useEffect to Fetch Users and Message History
    // ==================================================================
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axiosInstance.get('/users/all-users');
                const otherUsers = response.data.filter(user => user._id !== currentUser.id);
                setUsers(otherUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
                toast.error(error.response?.data?.message || 'Failed to fetch users.');
            }
        };

        const fetchMessages = async () => {
            if (!selectedUser || !currentUser) return;
            try {
                const response = await axiosInstance.get(`/users/messages/${selectedUser._id}`);
                // The fetched messages now have valid timestamps
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching old messages:', error);
                toast.error(error.response?.data?.message || 'Failed to fetch message history.');
                setMessages([]);
            }
        };
        
        if (currentUser) {
            fetchUsers();
        }

        if (selectedUser && currentUser) {
            fetchMessages();
        }

    }, [selectedUser, currentUser]);

    // ==================================================================
    // 3. Updated Functions & JSX
    // ==================================================================
    const handleLogout = () => {
        if (socket && currentUser) {
            socket.emit('userOffline', currentUser.id);
            socket.disconnect();
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.info('Logged out successfully!');
        navigate('/login');
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() && socket && currentUser && selectedUser) {
            const messageData = {
                senderId: currentUser.id,
                receiverId: selectedUser._id,
                text: newMessage.trim(),
            };
            socket.emit('sendMessage', messageData);

            // Optimistically add message to local state
            // The backend now sends the full message back, so this is no longer needed
            // setMessages((prevMessages) => [...prevMessages, messageData]); 
            setNewMessage('');
        } else if (!selectedUser) {
            toast.warn("Please select a user to chat with first!");
        }
    };

    if (loading || !currentUser) {
        return (
            <Container maxWidth="md" style={{ marginTop: '50px', textAlign: 'center' }}>
                <CircularProgress />
                <Typography>Loading dashboard...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" style={{ marginTop: '50px', display: 'flex', gap: '20px', height: 'calc(100vh - 100px)' }}>
            <Paper elevation={3} style={{ flex: 1, minWidth: '250px', padding: '15px', overflowY: 'auto' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Users</Typography>
                    <Button variant="outlined" size="small" onClick={handleLogout}>
                        Logout
                    </Button>
                </Box>
                <Divider />
                <List>
                    {users.length === 0 ? (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
                            No other users found.
                        </Typography>
                    ) : (
                        users.map((userItem) => (
                            <ListItem
                                button
                                key={userItem._id}
                                onClick={() => handleSelectUser(userItem)}
                                selected={selectedUser && selectedUser._id === userItem._id}
                                sx={{ borderBottom: '1px solid #eee' }}
                            >
                                <ListItemText primary={userItem.username} secondary={userItem.email} />
                            </ListItem>
                        ))
                    )}
                </List>
            </Paper>

            <Paper elevation={3} style={{ flex: 3, display: 'flex', flexDirection: 'column', padding: '15px' }}>
                {selectedUser ? (
                    <>
                        <Typography variant="h5" gutterBottom>
                            Chat with {selectedUser.username}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, border: '1px solid #eee', borderRadius: '4px', mb: 2 }}>
                            {messages.length === 0 ? (
                                <Typography color="textSecondary" textAlign="center">
                                    Start your conversation!
                                </Typography>
                            ) : (
                                messages.map((msg, index) => (
                                    <Box key={index} sx={{
                                        display: 'flex',
                                        justifyContent: msg.senderId === currentUser.id ? 'flex-end' : 'flex-start',
                                        mb: 1
                                    }}>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 1.5,
                                                maxWidth: '70%',
                                                backgroundColor: msg.senderId === currentUser.id ? '#e3f2fd' : '#f0f0f0',
                                                borderRadius: '10px',
                                                borderTopRightRadius: msg.senderId === currentUser.id ? 0 : '10px',
                                                borderBottomRightRadius: msg.senderId === currentUser.id ? 0 : '10px',
                                                borderTopLeftRadius: msg.senderId === currentUser.id ? '10px' : 0,
                                                borderBottomLeftRadius: msg.senderId === currentUser.id ? '10px' : 0,
                                            }}
                                        >
                                            <Typography variant="body2">
                                                <strong>{msg.senderUsername}:</strong> {msg.text}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem', display: 'block', textAlign: msg.senderId === currentUser.id ? 'right' : 'left' }}>
                                                {/* This line will now work correctly */}
                                                {new Date(msg.timestamp).toLocaleTimeString()}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                ))
                            )}
                        </Box>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                            sx={{ mb: 1 }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSendMessage}
                            disabled={!socket || !newMessage.trim()}
                        >
                            Send Message
                        </Button>
                    </>
                ) : (
                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography variant="h6" color="textSecondary">
                            Select a user from the left to start chatting!
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default Dashboard;