import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#C1581B',
      light: '#E8823A',
      dark: '#B34E16',
      contrastText: '#FEFCF8'
    },
    secondary: {
      main: '#F5E6D3',
      light: '#FAF0E6',
      dark: '#E8D5B7',
      contrastText: '#2C1810'
    },
    text: {
      primary: '#2C1810',
      secondary: '#6B5B4F'
    },
    background: {
      default: '#FEFCF8',
      paper: '#FFFFFF'
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121'
    }
  },
  typography: {
    fontFamily: '"League Spartan", system-ui, -apple-system, sans-serif',
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
      fontSize: '2.75rem',
      lineHeight: 1.3
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
      fontSize: '2.25rem',
      lineHeight: 1.4
    },
    h4: {
      fontFamily: '"League Spartan", sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4
    },
    h5: {
      fontFamily: '"League Spartan", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.5
    },
    h6: {
      fontFamily: '"League Spartan", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5
    }
  },
  shape: {
    borderRadius: 12
  }
});

// Add custom accent color to theme
declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
  }

  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
  }
}

theme.palette.accent = {
  main: '#7BA05B',
  light: '#9BC47A',
  dark: '#5D7A43',
  contrastText: '#FEFCF8'
};

export default theme;