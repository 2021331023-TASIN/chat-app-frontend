import { createTheme } from '@mui/material/styles';

// Define a more modern theme with a vibrant color palette
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007bff', // A vibrant, modern blue
    },
    secondary: {
      main: '#6c757d', // A neutral gray for secondary actions
    },
    background: {
      default: '#f8f9fa', // A subtle off-white for the overall background
      paper: '#ffffff', // Pure white for cards and components
    },
    text: {
      primary: '#212529', // A dark gray for high readability
      secondary: '#495057',
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
          boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
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
      main: '#007bff', // Keeping the primary blue consistent
    },
    secondary: {
      main: '#6c757d', // A neutral gray for secondary actions
    },
    background: {
      default: '#1b1c1d', // A deep charcoal gray for the background
      paper: '#2c2d2e', // A slightly lighter dark gray for cards
    },
    text: {
      primary: '#e9ecef', // Light gray for readability
      secondary: '#adb5bd',
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
          boxShadow: '0 6px 16px rgba(0,0,0,0.35)',
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