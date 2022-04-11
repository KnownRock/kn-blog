import {
  useContext, useEffect, useRef, useState,
} from 'react'
import {
  Box, Card, CardActionArea, CardContent,
  CardMedia, Container, Fab, IconButton, Input,
  Tooltip,
  Typography,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { useTranslation } from 'react-i18next'
import { RawDraftContentState } from 'draft-js'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import SendIcon from '@mui/icons-material/Send'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import EditIcon from '@mui/icons-material/Edit'
import { useFileText } from '../../../hooks/fs-hooks'
import Basic from '../Basic'
import {
  resolvePath, saveDataUrl, saveText, saveTextFile,
} from '../../../utils/fs'
import InfoContext from '../../../contexts/InfoContext'
import ArticleEditor from '../../../components/ArticleEditor'
import useLoading from '../../../contexts/LoadingContext'
import { useSelectFile, useSelectImg } from '../../../hooks/use-selector'
import FolderSelector from '../../Files/FolderSelector'

export const defaultImg = '/static/images/card.jpg'

function Viewer({ path, readOnly: parReadOnly, setTitle: setTopTitle }:
{ path: string, readOnly: boolean, setTitle?:(title:string)=>void }) {
  const { error: infoError, notify } = useContext(InfoContext)
  const { info } = useContext(InfoContext)
  const { text, loading, error } = useFileText(path || '')
  const { t } = useTranslation()
  const { getImgAsDataUrl } = useSelectImg()
  const [preview, setPreview] = useState(false)

  useLoading(loading)

  const [dataUrl, setDataUrl] = useState('')
  const [title, setTitle] = useState('')
  const editorContentState = useRef<RawDraftContentState>()

  const [contentState, setContentState] = useState<RawDraftContentState | undefined>(undefined)

  const readOnly = parReadOnly || path.endsWith('.knbe') || preview

  useEffect(() => {
    if (title) {
      setTopTitle?.(title)
    }
  }, [title, setTopTitle])

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

  const handleExport = async () => {
    let newName = path.replace(/\.knb$/, '')

    await info({
      title: t('Export'),
      component: (
        <FolderSelector type="file" onSelect={(fp) => { newName = fp }} nowPath={newName} />
      ),
      noBlur: true,
    })

    const { bucket, path: rPath, minioClient } = await resolvePath(newName)

    const { protocol, host, port } = minioClient as unknown as {
      protocol: string, host: string, port: number,
    }

    const urlPrefix = `${protocol}//${host}:${port}/${bucket}/${rPath}`
    if (dataUrl !== defaultImg) {
      await saveDataUrl(`${newName}/bg`, dataUrl)
    }
    const entityMap = editorContentState.current?.entityMap

    const entityKeys : Array<number> = []
    let summary = ''
    editorContentState.current?.blocks.forEach((block) => {
      summary += block.text

      Array.from(block.entityRanges).forEach((entityRange) => {
        const entityKey = entityRange.key
        summary += block.text.substr(entityRange.offset, entityRange.length)
        entityKeys.push(entityKey)
      })
    })
    const newEntityMap : typeof entityMap = {}
    const promises = entityKeys.map((entityKey) => {
      const entity = entityMap?.[entityKey]
      if (!entity) return

      const { data } = entity
      const dataUrl1 = data.src
      const url = `${urlPrefix}/${entityKey}`
      // eslint-disable-next-line consistent-return
      return saveDataUrl(`${newName}/${entityKey}`, dataUrl1)
        .then(() => {
          newEntityMap[entityKey] = {
            ...entity,
            data: {
              ...entity.data,
              src: url,
            },
          }
        })
    })

    await Promise.all(promises)
    await saveText(`${newName}/index.knbe`, JSON.stringify({
      content: {
        ...editorContentState.current,
        entityMap: newEntityMap,
      },
      dataUrl: (dataUrl !== defaultImg) ? `${urlPrefix}/bg` : '',
      title,
      summary: summary.slice(0, 500),
    })).then(() => notify({
      message: t('Blog exported'),
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
    }).then(() => {
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
        <Box sx={{
          position: 'relative',
          right: 0,
          height: 0,
          zIndex: 1,
        }}
        >
          <Box
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {(!loading && defaultImg !== dataUrl && !readOnly) && (
            <IconButton color="warning" onClick={handleRemoveImg}>

              <RemoveCircleOutlineIcon />
            </IconButton>
            )}
          </Box>
        </Box>
        <CardActionArea
          sx={{

          }}
          onClick={handleSelectImg}
        >
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
            readOnly={readOnly}
            contentState={contentState}
            onContentStateChange={
            (newValue) => {
              editorContentState.current = newValue
            }
          }
          />
        </CardContent>
      </Card>

      {(!readOnly || preview) && (
        <>
          {!preview ? (
            <Tooltip placement="left" title={t('Preview') as string}>
              <Fab
                color="primary"
                aria-label="preview"
                sx={{
                  position: 'fixed',
                  bottom: 152,
                  right: 16,
                }}
                size="large"
                onClick={() => setPreview(true)}
              >
                <RemoveRedEyeIcon />
              </Fab>
            </Tooltip>
          ) : (
            <Tooltip placement="left" title={t('Edit') as string}>
              <Fab
                color="primary"
                aria-label="preview"
                sx={{
                  position: 'fixed',
                  bottom: 152,
                  right: 16,
                }}
                size="large"
                onClick={() => setPreview(false)}
              >
                <EditIcon />
              </Fab>
            </Tooltip>
          )}
          <Tooltip placement="left" title={t('Export') as string}>
            <Fab
              color="primary"
              aria-label="export"
              sx={{
                position: 'fixed',
                bottom: 84,
                right: 16,
              }}
              size="large"
              onClick={handleExport}
            >
              <SendIcon />
            </Fab>
          </Tooltip>
          <Tooltip placement="left" title={t('Save') as string}>
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
          </Tooltip>
        </>

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
