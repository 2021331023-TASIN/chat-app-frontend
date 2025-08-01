// =======================================================
// === START OF CORRECTED DASHBOARD.JS FILE ===
// =======================================================
import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, CircularProgress, Paper, List, ListItem, ListItemText, Divider, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../utils/AxiosInstance';
import { io } from 'socket.io-client';
import SendIcon from '@mui/icons-material/Send';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const BACKEND_SOCKET_URL = 'https://chat-app-backend-0d86.onrender.com';

const createTempMessage = (text, senderId, receiverId) => ({
    _id: `temp-${Date.now()}`,
    text,
    senderId,
    receiverId,
    createdAt: new Date().toISOString(),
    isSending: true,
    senderUsername: 'You',
});

const Dashboard = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);

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

            newSocket = io(BACKEND_SOCKET_URL, {
                query: {
                    userId: parsedUser.id,
                },
            });
            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Socket.IO connected!');
            });
            
            newSocket.on('newMessage', (message) => {
                console.log('Received new message:', message);
                setMessages((prevMessages) => {
                    if (message.senderId?.toString() === parsedUser.id?.toString()) {
                        return prevMessages;
                    }
                    return [...prevMessages, message];
                });
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
                newSocket.off('newMessage');
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
                const response = await axiosInstance.get(`/messages/${selectedUser._id}`);
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

    const handleLogout = () => {
        if (socket && currentUser) {
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

    const handleSendMessage = async () => {
        if (newMessage.trim() && currentUser && selectedUser) {
            const tempMessage = createTempMessage(newMessage.trim(), currentUser.id, selectedUser._id);
            
            setMessages((prevMessages) => [...prevMessages, tempMessage]);
            setNewMessage('');

            try {
                const messageData = {
                    text: tempMessage.text,
                };
                const response = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);

                console.log('Message sent successfully:', response.data);

                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg._id === tempMessage._id
                            ? { ...response.data, isSending: false }
                            : msg
                    )
                );
            } catch (error) {
                console.error('Error sending message:', error.response?.data?.message || 'Failed to send message.');
                
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg._id === tempMessage._id
                            ? { ...msg, isSending: false, failed: true }
                            : msg
                    )
                );
                toast.error('Failed to send message.');
            }
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
                                messages.map((msg) => {
                                    const createdAtDate = new Date(msg.createdAt);
                                    const isValidDate = !isNaN(createdAtDate.getTime());

                                    return (
                                        <Box key={msg._id} sx={{
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
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    position: 'relative',
                                                    opacity: msg.isSending ? 0.6 : 1
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ wordWrap: 'break-word' }}>
                                                    <strong>
                                                        {msg.senderId === currentUser.id ? 'You' : msg.senderUsername}:
                                                    </strong> {msg.text}
                                                </Typography>
                                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                                                        {isValidDate ? createdAtDate.toLocaleTimeString() : 'Invalid Date'}
                                                    </Typography>
                                                    {msg.isSending && (
                                                        <CircularProgress size={12} sx={{ ml: 1, color: '#9e9e9e' }} />
                                                    )}
                                                    {msg.failed && (
                                                        <ErrorOutlineIcon sx={{ color: 'red', ml: 1, fontSize: '0.8rem' }} />
                                                    )}
                                                </Box>
                                            </Paper>
                                        </Box>
                                    );
                                }))}
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
                            disabled={!newMessage.trim()}
                            endIcon={<SendIcon />}
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
// =======================================================
// === END OF CORRECTED DASHBOARD.JS FILE ===
// =======================================================