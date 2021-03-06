import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Container from '@mui/material/Container'
import Fab from '@mui/material/Fab'
import Input from '@mui/material/Input'
import Typography from '@mui/material/Typography'
import { useLocation } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import React, { Ref, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TopBar from '../../components/TopBar'

import ArticleEditor from '../../components/ArticleEditor'

export default function Article() {
  const [isEditing, setIsEditing] = useState(true)

  const location = useLocation()
  const { t } = useTranslation()

  const id = location.pathname.match(/(?<=\/)[^/]+$/)?.[0] ?? ''

  return (
    <Box sx={{
      height: '100vh',
      // bgcolor: 'main.background',
    }}
    >
      <TopBar />

      <Container
        maxWidth="md"
        sx={{
          padding: {
            xs: 0,
            sm: 0,
            md: 4,

          },
        }}
      >
        <Card>
          <CardActionArea>
            <CardMedia
              component="img"
              height={
              +(import.meta.env.VITE_APP_CARD_MEDIA_HEIGHT ?? '400')
            }
              image="/static/images/card.png"
              alt="green iguana"
            />
          </CardActionArea>
          <CardContent>
            {isEditing ? (
              <Input
              // from="MuiTypography-h4"
                sx={{
                  margin: 0,

                  fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
                  fontWeight: 400,
                  fontSize: '2.125rem',
                  lineHeight: 1.235,
                  letterSpacing: '0.00735em',
                  marginBottom: '0.35em',
                  width: '100%',
                }}
                placeholder={t('Title')}
              />
            ) : (
              <Typography sx={{ marginBottom: '0.35em' }} variant="h4" component="div">
                Node Red
              </Typography>
            )}

            <ArticleEditor />
          </CardContent>
        </Card>

      </Container>

      {!isEditing ? (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          size="large"
          onClick={() => setIsEditing(true)}
        >
          <EditIcon />
        </Fab>
      ) : (
        <Fab
          color="primary"
          aria-label="save"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          size="large"
          onClick={() => setIsEditing(false)}
        >
          <SaveIcon />
        </Fab>
      )}

    </Box>
  )
}
