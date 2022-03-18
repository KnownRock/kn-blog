import {
  Box, Card, CardContent, Container, Fab, Input,
} from '@mui/material'
import { useLocation } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import React, { Ref } from 'react'
import TopBar from '../../components/TopBar'

import ArticleEditor from '../../components/ArticleEditor'

export default function Article() {
  const location = useLocation()

  const id = location.pathname.match(/(?<=\/)[^/]+$/)?.[0] ?? ''

  return (
    <Box sx={{
      height: '100vh',
    }}
    >
      <TopBar />

      <Container
        maxWidth="lg"
        sx={{
          padding: {
            xs: 0,
            sm: 0,
            md: 0,
            lg: 3,
            xl: 3,
          },
        }}
      >
        <Card>
          <CardContent>
            <ArticleEditor />
          </CardContent>
        </Card>

      </Container>
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        size="large"
      >
        <EditIcon />
      </Fab>
    </Box>
  )
}
