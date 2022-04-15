import * as React from 'react'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CardActionArea from '@mui/material/CardActionArea'
import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useFileText } from '../../hooks/fs-hooks'

const defaultImg = '/static/images/card.jpg'
export default function ArticleCard({ object }:{
  object: FileInfo
}) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [error, setError] = React.useState(false)

  const onOpen = useCallback(() => {
    navigate(`/article-viewer/${object.name}`)
  }, [navigate, object.name])

  const { text, loading } = useFileText(`${object.name}`)

  const { dataUrl, title, summary } = React.useMemo(() => {
    if (!loading || error) {
      try {
        const d = JSON.parse(text)
        return d as {
          dataUrl: string
          title:string
          summary: string
        }
      } catch (e) {
        return {
          dataUrl: '',
          title: '',
          summary: '',
        }
      }
    }
    return {
      dataUrl: '',
      title: '',
      summary: '',
    }
  }, [loading, error, text])

  return (
    <Card>
      <CardActionArea onClick={onOpen}>

        <Box sx={{
          height: {
            xs: 300,
            sm: 400,
            md: 500,
            lg: 500,
            xl: 500,
          },
        }}
        >

          {!loading && (
          <CardMedia
            component="img"
            sx={{
              width: '100%',
              height: '100%',
            }}
            image={(!dataUrl && !loading) ? defaultImg : dataUrl}
            alt="background"
          />
          )}

        </Box>
      </CardActionArea>
      <CardContent>
        <Typography
          gutterBottom
          variant="h4"
          component="div"
          sx={{
            height: 40,

          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            height: 60,
            overflow: 'hidden',
          }}
        >
          {summary}
          ...
        </Typography>
      </CardContent>

      <CardActions>
        {/* <Button size="small">分享</Button> */}
        <Button size="small" onClick={onOpen}>{t('More')}</Button>
      </CardActions>

    </Card>
  )
}
