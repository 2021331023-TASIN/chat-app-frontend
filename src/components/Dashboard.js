import React, { useEffect, useState, useRef } from 'react';
import { Container, Typography, Button, Box, CircularProgress, Paper, List, ListItem, ListItemText, Divider, TextField, Avatar, ListItemAvatar } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
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

// WhatsApp inspired theme
const whatsAppTheme = createTheme({
    palette: {
        primary: {
            main: '#075e54',
            light: '#dcf8c6',
        },
        secondary: {
            main: '#25d366',
        },
        background: {
            default: '#ece5dd', // Chat background
            paper: '#ffffff',  // Sidebar and chat container background
        },
        text: {
            primary: '#000000',
            secondary: '#757575',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    color: '#fff',
                    backgroundColor: '#25d366',
                    '&:hover': {
                        backgroundColor: '#1da851',
                    },
                },
            },
        },
    },
});

const avatarsList = [
    'https://i.ibb.co/3s3p72d/avatar1.png',
    'https://i.ibb.co/S7q551x/avatar2.png',
    'https://i.ibb.co/g7z6V2H/avatar3.png',
    'https://i.ibb.co/f4g150b/avatar4.png',
    'https://i.ibb.co/fM86T5L/avatar5.png',
    'https://i.ibb.co/g7z6V2H/avatar3.png',
    'https://i.ibb.co/gM87d4t/avatar6.png',
    'https://i.ibb.co/6P6XwWq/avatar7.png',
    'https://i.ibb.co/7j95Tf1/avatar8.png',
    'https://i.ibb.co/5c8c2Hq/avatar9.png',
];

const Dashboard = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(null);

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
            setSelectedAvatar(parsedUser.avatarUrl || null);

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

    useEffect(() => {
        const scrollToBottom = () => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
            }
        };
        scrollToBottom();
    }, [messages]);

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

                const newMessageFromBackend = {
                    ...response.data,
                    isSending: false,
                    senderId: currentUser.id,
                };
                
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg._id === tempMessage._id
                            ? newMessageFromBackend
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
    
    const handleSaveAvatar = async () => {
        if (!selectedAvatar) {
            toast.warn('Please select an avatar first.');
            return;
        }
        try {
            await axiosInstance.put('/users/avatar', { avatarUrl: selectedAvatar });
            const updatedUser = { ...currentUser, avatarUrl: selectedAvatar };
            setCurrentUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            toast.success('Avatar updated successfully!');
            setShowAvatarPicker(false);
        } catch (error) {
            console.error('Error updating avatar:', error);
            toast.error('Failed to update avatar.');
        }
    };

    if (loading || !currentUser) {
        return (
            <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography>Loading dashboard...</Typography>
            </Container>
        );
    }

    return (
        <ThemeProvider theme={whatsAppTheme}>
            <Container maxWidth="lg" sx={{ mt: 8, display: 'flex', gap: 3, height: 'calc(100vh - 100px)', backgroundColor: 'background.default' }}>
                <Paper sx={{ flex: 1, minWidth: 250, p: 3, overflowY: 'auto', backgroundColor: 'background.paper' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Users</Typography>
                        <Button variant="contained" onClick={() => setShowAvatarPicker(true)} size="small" sx={{ color: '#fff' }}>
                            Choose Avatar
                        </Button>
                    </Box>
                    <Divider />
                    <List>
                        {users.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                                No other users found.
                            </Typography>
                        ) : (
                            users.map((userItem) => (
                                <ListItem
                                    button
                                    key={userItem._id}
                                    onClick={() => handleSelectUser(userItem)}
                                    selected={selectedUser && selectedUser._id === userItem._id}
                                    sx={{ borderBottom: '1px solid', borderColor: 'divider', '&.Mui-selected': { backgroundColor: 'action.selected' } }}
                                >
                                    <ListItemAvatar>
                                        <Avatar alt={userItem.username} src={userItem.avatarUrl} />
                                    </ListItemAvatar>
                                    <ListItemText primary={userItem.username} secondary={userItem.email} />
                                </ListItem>
                            ))
                        )}
                    </List>
                </Paper>

                <Paper sx={{ flex: 3, display: 'flex', flexDirection: 'column', p: 3, backgroundColor: 'background.paper' }}>
                    {selectedUser ? (
                        <>
                            {/* ✅ UPDATED: The chat header now contains the Logout button */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Avatar alt={selectedUser.username} src={selectedUser.avatarUrl} />
                                <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold', flexGrow: 1 }}>
                                    Chat with {selectedUser.username}
                                </Typography>
                                <Button variant="contained" onClick={handleLogout} sx={{ color: '#fff' }}>
                                    Logout
                                </Button>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Box 
                                ref={messagesEndRef}
                                sx={{ flexGrow: 1, overflowY: 'auto', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2, backgroundColor: 'background.default' }}
                            >
                                {messages.length === 0 ? (
                                    <Typography color="text.secondary" textAlign="center">
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
                                                        backgroundColor: msg.senderId === currentUser.id ? 'primary.light' : 'background.paper',
                                                        borderRadius: '16px',
                                                        borderTopRightRadius: msg.senderId === currentUser.id ? 2 : '16px',
                                                        borderBottomRightRadius: msg.senderId === currentUser.id ? 2 : '16px',
                                                        borderTopLeftRadius: msg.senderId === currentUser.id ? '16px' : 2,
                                                        borderBottomLeftRadius: msg.senderId === currentUser.id ? '16px' : 2,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        position: 'relative',
                                                        opacity: msg.isSending ? 0.6 : 1,
                                                    }}
                                                >
                                                    <Typography variant="body2" sx={{ wordWrap: 'break-word', color: 'text.primary' }}>
                                                        <strong>
                                                            {msg.senderId === currentUser.id ? 'You' : msg.senderUsername}:
                                                        </strong> {msg.text}
                                                    </Typography>
                                                    <Box display="flex" alignItems="center" justifyContent="space-between" mt={0.5}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                            {isValidDate ? createdAtDate.toLocaleTimeString() : 'Invalid Date'}
                                                        </Typography>
                                                        {msg.isSending && (
                                                            <CircularProgress size={12} sx={{ ml: 1, color: 'text.secondary' }} />
                                                        )}
                                                        {msg.failed && (
                                                            <ErrorOutlineIcon sx={{ color: 'error.main', ml: 1, fontSize: '0.8rem' }} />
                                                        )}
                                                    </Box>
                                                </Paper>
                                            </Box>
                                        );
                                    })
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                                    size="small"
                                    sx={{ backgroundColor: 'background.paper' }}
                                />
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    endIcon={<SendIcon />}
                                    sx={{ borderRadius: '8px' }}
                                >
                                    Send
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography variant="h6" color="text.secondary">
                                Select a user from the left to start chatting!
                            </Typography>
                        </Box>
                    )}
                </Paper>
                
                {showAvatarPicker && (
                    <Box sx={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2, zIndex: 1000 }}>
                        <Typography variant="h6" mb={2}>Choose your avatar</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 300, overflowY: 'auto' }}>
                            {avatarsList.map((avatar, index) => (
                                <Avatar
                                    key={index}
                                    src={avatar}
                                    alt={`Avatar ${index + 1}`}
                                    onClick={() => setSelectedAvatar(avatar)}
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        cursor: 'pointer',
                                        border: selectedAvatar === avatar ? '3px solid #25d366' : '1px solid #ccc',
                                    }}
                                />
                            ))}
                        </Box>
                        <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
                            <Button variant="outlined" onClick={() => setShowAvatarPicker(false)}>
                                Cancel
                            </Button>
                            <Button variant="contained" onClick={handleSaveAvatar} disabled={!selectedAvatar}>
                                Save
                            </Button>
                        </Box>
                    </Box>
                )}
                {showAvatarPicker && <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 999 }} onClick={() => setShowAvatarPicker(false)} />}
            </Container>
        </ThemeProvider>
    );
};

export default Dashboard;