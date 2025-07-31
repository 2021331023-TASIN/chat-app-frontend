import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, CircularProgress, Paper, List, ListItem, ListItemText, Divider, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from '../utils/AxiosInstance'; // Your Axios instance
import { io } from 'socket.io-client'; // Import socket.io-client

const Dashboard = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]); // State to store other users
    const [selectedUser, setSelectedUser] = useState(null); // User currently chatting with
    const [messages, setMessages] = useState([]); // Messages for the current chat
    const [newMessage, setNewMessage] = useState(''); // Input for new message
    const [socket, setSocket] = useState(null); // Socket.IO instance

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
            toast.error('You need to log in to access this page.');
            navigate('/login');
            setLoading(false);
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);
            setCurrentUser(parsedUser);

            // Initialize Socket.IO connection
            const newSocket = io('https://chat-app-backend-0d86.onrender.com'); // Connect to your backend socket.io server
            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Socket.IO connected!');
                // Emit 'userOnline' event when connected, sending the current user's ID
                newSocket.emit('userOnline', parsedUser.id);
            });

            // Listen for incoming messages
            newSocket.on('receiveMessage', (message) => {
                console.log('Received message:', message);
                // Add message to state only if it belongs to the currently selected chat
                // (either sent by current user to selected user, or by selected user to current user)
                if (selectedUser && (
                    (message.senderId === selectedUser._id && message.receiverId === parsedUser.id) ||
                    (message.senderId === parsedUser.id && message.receiverId === selectedUser._id)
                )) {
                    setMessages((prevMessages) => [...prevMessages, message]);
                }
            });

            newSocket.on('disconnect', () => {
                console.log('Socket.IO disconnected!');
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket.IO connection error:', err.message);
                toast.error('Real-time connection failed. Please try again.');
            });

            // Fetch all other users
            const fetchUsers = async () => {
                try {
                    const response = await axios.get('/users/all-users');
                    setUsers(response.data);
                } catch (error) {
                    console.error('Error fetching users:', error);
                    toast.error(error.response?.data?.message || 'Failed to fetch users.');
                }
            };
            fetchUsers();

            // Cleanup function for Socket.IO
            return () => {
                if (newSocket) {
                    newSocket.disconnect();
                }
            };

        } catch (e) {
            console.error("Failed to parse user from localStorage or connect socket", e);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            toast.error('User data corrupted or connection error. Please log in again.');
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate, selectedUser]); // Rerun effect when selectedUser changes to update message filtering

    const handleLogout = () => {
        if (socket) {
            socket.disconnect(); // Disconnect socket on logout
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.info('Logged out successfully!');
        navigate('/login');
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setMessages([]); // Clear messages for new chat
        // In a real application, you'd fetch message history for this chat here
    };

    const handleSendMessage = () => {
        if (newMessage.trim() && socket && currentUser && selectedUser) {
            const messageData = {
                senderId: currentUser.id,
                senderUsername: currentUser.username, // Using username from current user state
                receiverId: selectedUser._id, // Ensure this matches backend user ID type
                receiverUsername: selectedUser.username, // Using username from selected user state
                text: newMessage.trim(),
                timestamp: new Date().toISOString(), // ISO string for consistent time
            };
            socket.emit('sendMessage', messageData); // Emit message to server

            // Optimistically add message to local state
            setMessages((prevMessages) => [...prevMessages, messageData]);
            setNewMessage(''); // Clear input field
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
            {/* Left Sidebar for Users List */}
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
                                {/* You could add an online indicator here based on real-time socket data */}
                            </ListItem>
                        ))
                    )}
                </List>
            </Paper>

            {/* Right Main Chat Area */}
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
                                                // Adjust corner radius for a speech bubble effect
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