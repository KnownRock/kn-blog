import {
  useContext, useEffect, useRef, useState,
} from 'react'
import Editor from '@monaco-editor/react'
import {
  Box, Card, CardActionArea, CardContent, CardMedia, Fab, Input, Modal, Typography,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { useTranslation } from 'react-i18next'
import { RawDraftContentState } from 'draft-js'
import { useFileText } from '../../../hooks/fs-hooks'
import Basic from '../Basic'
import { getFileAsDataUrl, saveTextFile } from '../../../utils/fs'
import InfoContext from '../../../contexts/InfoContext'
import ArticleEditor from '../../../components/ArticleEditor'
import FolderSelector from '../../Files/FolderSelector'

function Viewer({ path, readOnly }: { path: string, readOnly: boolean }) {
  const { error: infoError, notify } = useContext(InfoContext)
  const { info } = useContext(InfoContext)
  const { text, loading, error } = useFileText(path || '')
  const { t } = useTranslation()

  // useLoading(loading)

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
        setDataUrl('/static/images/card.jpg')
      }

      setContentState(content as RawDraftContentState)
    } catch (er) {
      // infoError(er as Error)
      setDataUrl('/static/images/card.jpg')

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

    let newName = ''

    info({
      title: t('Select file'),
      component: (
        <FolderSelector type="file" onSelect={(fp) => { newName = fp }} nowPath={newName} />
      ),
      noBlur: true,

      isOk: async () => true,
    }).then(() => {
      // setImgPath(newName)
      getFileAsDataUrl(newName).then((parDataUrl) => {
        setDataUrl(parDataUrl)
      }).catch((e) => {
        infoError(e)
      })
    })
  }

  return (
    <>
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
              lg: 600,
              xl: 700,
            },
          }}
          >
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
    </>

  )
}

export default function TextViewerPage() {
  return (
    <Basic
      FileViewer={Viewer}
    />
  )
}
