import * as React from 'react'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { SxProps, Theme, CardActionArea } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCallback } from 'react'

export default function ArticleCard(sx: SxProps<Theme>) {
  const navigate = useNavigate()

  const onOpen = useCallback(() => {
    navigate('/articles/123')
  }, [navigate])

  return (
    <Card sx={sx}>
      <CardActionArea onClick={onOpen}>
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
        <Typography gutterBottom variant="h4" component="div">
          Node Red
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Lizards are a widespread group of squamate reptiles, with over 6,000
          species, ranging across all continents except Antarctica
        </Typography>
      </CardContent>

      <CardActions>
        {/* <Button size="small">分享</Button> */}
        <Button size="small" onClick={onOpen}>查看</Button>
      </CardActions>

    </Card>
  )
}
