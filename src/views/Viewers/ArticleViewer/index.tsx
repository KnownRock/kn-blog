import {
  useContext, useEffect, useRef, useState,
} from 'react'
import {
  Box, Card, CardActionArea, CardContent,
  CardMedia, Container, Fab, IconButton, Input,
  Typography,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { useTranslation } from 'react-i18next'
import { RawDraftContentState } from 'draft-js'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import { useFileText } from '../../../hooks/fs-hooks'
import Basic from '../Basic'
import { saveTextFile } from '../../../utils/fs'
import InfoContext from '../../../contexts/InfoContext'
import ArticleEditor from '../../../components/ArticleEditor'
import useLoading from '../../../contexts/LoadingContext'
import { useSelectImg } from '../../../hooks/useSelectImg'

export const defaultImg = '/static/images/card.jpg'

function Viewer({ path, readOnly }: { path: string, readOnly: boolean }) {
  const { error: infoError, notify } = useContext(InfoContext)
  const { info } = useContext(InfoContext)
  const { text, loading, error } = useFileText(path || '')
  const { t } = useTranslation()
  const { getImgAsDataUrl } = useSelectImg()

  useLoading(loading)

  const [dataUrl, setDataUrl] = useState('')
  const [title, setTitle] = useState('')

  const editorContentState = useRef<RawDraftContentState>()

  const [contentState, setContentState] = useState<RawDraftContentState | undefined>(undefined)

  useEffect(() => {
    if (loading) return
    try {
      const blogObj = JSON.parse(text)
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const { title, dataUrl, content } = blogObj
      setTitle(title)
      setDataUrl(dataUrl)
      if (!dataUrl) {
        setDataUrl(defaultImg)
      }
      editorContentState.current = content
      setContentState(content as RawDraftContentState)
    } catch (er) {
      // infoError(er as Error)
      setDataUrl(defaultImg)

      notify((er as Error).message)
    }
  }, [infoError, loading, notify, text])

  const handleSave = () => {
    saveTextFile(path, JSON.stringify({
      content: editorContentState.current,
      dataUrl,
      title,
    })).then(() => notify({
      message: t('File saved'),
    })).catch((e) => {
      infoError(e)
    })
  }

  const handleSelectImg = () => {
    if (readOnly) return

    getImgAsDataUrl().then((dUrl) => {
      if (!dUrl) {
        setDataUrl(defaultImg)
      } else {
        setDataUrl(dUrl)
      }
    })
  }

  function handleRemoveImg() {
    if (readOnly) return

    info({
      title: t('Remove image'),
      content: t('Are you sure to remove the image?'),
    }).then((r) => {
      setDataUrl(defaultImg)
    }).catch(() => {
      // do nothing
    })
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        paddingLeft: {
          xs: 0,
          sm: 0,
          md: 0,
          lg: 0,
          xl: 0,
        },
        paddingRight: {
          xs: 0,
          sm: 0,
          md: 0,
          lg: 0,
          xl: 0,
        },
      }}
    >
      <Card sx={{
        flexGrow: 1,
        overflow: 'auto',
      }}
      >
        <CardActionArea onClick={handleSelectImg}>
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
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,

              }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              {(defaultImg !== dataUrl && !readOnly) && (
              <IconButton color="warning" onClick={handleRemoveImg}>

                <RemoveCircleOutlineIcon />
              </IconButton>
              )}
            </Box>
            {dataUrl && (
            <CardMedia
              component="img"
              sx={{
                width: '100%',
                height: '100%',
              }}
              src={dataUrl}
              alt="background"
            />
            )}
          </Box>

        </CardActionArea>
        <CardContent>

          {!readOnly ? (
            <Input
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          ) : (
            <Typography sx={{ marginBottom: '0.35em' }} variant="h4" component="div">
              {title}
            </Typography>
          )}

          <ArticleEditor
            readonly={readOnly}
            contentState={contentState}
            onContentStateChange={
            (newValue) => {
              editorContentState.current = newValue
            }
          }
          />
        </CardContent>
      </Card>

      {!readOnly && (
      <Fab
        color="primary"
        aria-label="save"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        size="large"
        onClick={handleSave}
      >
        <SaveIcon />
      </Fab>
      )}
    </Container>

  )
}

export default function TextViewerPage() {
  return (
    <Basic
      FileViewer={Viewer}
    />
  )
}
