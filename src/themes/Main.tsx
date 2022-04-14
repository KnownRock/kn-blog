import { createTheme, ThemeProvider } from '@mui/material/styles'

import './index.css'

export default function Theme(
  {
    children,
    mode = 'dark',
  }:
  {
    children: React.ReactNode,
    mode: 'light' | 'dark',
  },
) {
  const template = {
    light: {
      components: {
      },
      palette: {
        mode,
        primary: {
          main: '#5c6bc0',
        },
        main: {
          background: 'rgba(255,255,255,.93)',
        },
      },

    },
    dark: {
      components: {
      },
      palette: {
        mode,
        primary: {
          main: '#7c4dff',
        },
      },
    },
  }

  return (
    <ThemeProvider
      theme={createTheme(template[mode])}
    >
      {children}
    </ThemeProvider>
  )
}
