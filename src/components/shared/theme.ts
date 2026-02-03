import { createTheme } from '@mui/material/styles';

// Professional color palette optimized for security applications
const palette = {
  primary: {
    main: '#1976d2',
    dark: '#115293',
    light: '#42a5f5',
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#424242',
    dark: '#1c1c1c',
    light: '#6d6d6d',
    contrastText: '#ffffff'
  },
  success: {
    main: '#2e7d32',
    dark: '#1b5e20',
    light: '#4caf50',
    contrastText: '#ffffff'
  },
  error: {
    main: '#d32f2f',
    dark: '#c62828',
    light: '#f44336',
    contrastText: '#ffffff'
  },
  warning: {
    main: '#ed6c02',
    dark: '#e65100',
    light: '#ff9800',
    contrastText: '#ffffff'
  },
  info: {
    main: '#0288d1',
    dark: '#01579b',
    light: '#03a9f4',
    contrastText: '#ffffff'
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff'
  }
};

// High-contrast theme for outdoor/guard use
const guardPalette = {
  ...palette,
  background: {
    default: '#000000',
    paper: '#1a1a1a'
  },
  text: {
    primary: '#ffffff',
    secondary: '#e0e0e0'
  },
  primary: {
    main: '#00e676',
    dark: '#00c853',
    light: '#69f0ae',
    contrastText: '#000000'
  },
  error: {
    main: '#ff1744',
    dark: '#d50000',
    light: '#ff5983',
    contrastText: '#ffffff'
  }
};

// Base theme configuration
export const baseTheme = createTheme({
  palette,
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.4
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.4
    },
    button: {
      textTransform: 'none',
      fontWeight: 500
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 48, // Touch-friendly minimum height
          fontSize: '1rem',
          fontWeight: 500,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.2)'
          }
        },
        sizeLarge: {
          minHeight: 56,
          fontSize: '1.1rem',
          padding: '16px 32px'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            minHeight: 48
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0,0,0,0.1)'
        }
      }
    }
  }
});

// High-contrast theme for guard interface (outdoor use)
export const guardTheme = createTheme({
  ...baseTheme,
  palette: guardPalette,
  components: {
    ...baseTheme.components,
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 64, // Larger touch targets for outdoor use
          fontSize: '1.25rem',
          fontWeight: 600,
          borderRadius: 12,
          border: '2px solid transparent',
          '&:hover': {
            borderColor: guardPalette.primary.main
          }
        },
        sizeLarge: {
          minHeight: 80,
          fontSize: '1.5rem',
          padding: '20px 40px'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            minHeight: 64,
            fontSize: '1.25rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)'
            }
          },
          '& .MuiInputLabel-root': {
            fontSize: '1.25rem',
            color: '#e0e0e0'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: 16
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 64,
          minHeight: 64
        }
      }
    }
  }
});

export default baseTheme;