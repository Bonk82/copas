import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';

// import { qatarTheme } from './qatarTheme';
import { euroTheme } from './euroTheme';


// eslint-disable-next-line react/prop-types
export const AppTheme = ({ children }) => {
  return (
    <ThemeProvider theme={ euroTheme }>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      { children }
    </ThemeProvider>
  )
}
