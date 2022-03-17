import { useState } from 'react'
import {
  AppBar, Box, createTheme, ThemeProvider, Toolbar, Typography,
} from '@mui/material'
import {
  Routes,
  Route,
} from 'react-router-dom'

import Article from './views/Article'
import Home from './views/Home'

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home />
      }
      />
      <Route
        path="/articles/:id"
        element={
          <Article />
        }
      />
      <Route path="me" element={3} />
    </Routes>
  )
}

export default App
