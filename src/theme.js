import { createTheme } from '@mui/material/styles';

// Define a classic-modern theme with light and dark modes
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4e54c8', // A soft, classic blue
    },
    secondary: {
      main: '#667eea', // A slightly lighter blue
    },
    background: {
      default: '#f4f7f6', // A very light gray for the overall background
      paper: '#ffffff', // Pure white for cards and components
    },
    text: {
      primary: '#333333', // A soft black for readability
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#bb86fc', // A vibrant purple for dark mode
    },
    secondary: {
      main: '#03dac6', // A teal for contrast
    },
    background: {
      default: '#121212', // Very dark gray for the background
      paper: '#1d1d1d', // Dark gray for cards and components
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

export { lightTheme, darkTheme };