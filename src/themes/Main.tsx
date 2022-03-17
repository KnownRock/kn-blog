import {
  createTheme, ThemeProvider,
} from '@mui/material'

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
      },

    },
    dark: {
      components: {
      },
      palette: {
        mode,
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
