import {
  Box, Button, ButtonGroup, Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import {
  useCallback,
  useContext,
  useEffect, useMemo, useState,
} from 'react'

import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDropzone } from 'react-dropzone'
import TopBar from '../../components/TopBar'
import FileBreadcrumbs from '../../components/FileBreadcrumbs'
import FileButton from './FileButton'
import { useDir } from '../../hooks/fs-hooks'
import { uploadFile as uploadFileToClient } from '../../utils/fs'

import FilesContext from '../../contexts/FilesContext'

import InfoContext from '../../contexts/InfoContext'
import NewFileButton from './NewFileButton'

function Files() {
  const { '*': path = '' } = useParams()
  const { t } = useTranslation()

  const {
    objects, loading, error, refetch,
  } = useDir(`/${path}`)

  const contextValue = useMemo(() => ({
    refetch,
  }), [refetch])

  const typedObjects = useMemo(() => {
    if (objects) {
      console.log(objects)

      return objects.map((object) => ({
        ...object,
        // type: object.name?.endsWith('/') || object.prefix?.endsWith('/') ? 'folder' : 'file',
      }))
    }
    return []
  }, [objects])

  const { info } = useContext(InfoContext)
  const remoteFolderObjects = useMemo(() => typedObjects.filter((object) => object.type === 'remote-folder'), [typedObjects])
  const folderObjects = useMemo(() => typedObjects.filter((object) => object.type === 'folder'), [typedObjects])
  const fileObjects = useMemo(() => typedObjects.filter((object) => object.type === 'file'), [typedObjects])

  const groupedObjects = useMemo(
    () => [{
      title: t('Remote Folders'),
      objects: remoteFolderObjects,
    }, {
      title: t('Folders'),
      objects: folderObjects,
    }, {
      title: t('Files'),
      objects: fileObjects,
    }].filter((group) => group.objects.length > 0),
    [t, remoteFolderObjects, folderObjects, fileObjects],
  )

  const uploadFile = async () => {
    await uploadFileToClient(path)
    refetch()
  }
  const uploadFolder = async () => {
    await uploadFileToClient(path, true)
    refetch()
  }

  // TODO: make better transition
  if (loading && !objects) {
    return <div>Loading...</div>
  }
  if (error && !objects) {
    return <div>Error</div>
  }

  return (
    <FilesContext.Provider value={contextValue}>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: 'white',
          padding: 1,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <FileBreadcrumbs path={path || ''} />
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
        }}
        >
          <ButtonGroup variant="contained" aria-label="outlined primary button group">
            <NewFileButton path={path || ''} />
            <Button variant="contained" onClick={uploadFolder}>
              {t('Upload folder')}
            </Button>
            <Button variant="contained" onClick={uploadFile}>
              {t('Upload')}
            </Button>
          </ButtonGroup>
        </Box>

      </Box>
      <Box
        sx={{
          paddingLeft: 2,
          paddingRight: 2,
        }}
      >
        {groupedObjects.map((group) => (
          <Box key={group.title}>
            <Typography variant="subtitle1" component="h6">{group.title}</Typography>

            <Grid container spacing={2}>
              {
          group.objects.map((obj) => (
            <Grid
              key={obj.name || obj.prefix}
              item
              xs={12}
              sm={4}
              md={3}
              lg={3}
              xl={3}
            >
              <Box>
                <FileButton object={obj} />
              </Box>
            </Grid>
          ))
        }

            </Grid>
          </Box>
        ))}

      </Box>
    </FilesContext.Provider>
  )
}

export default function FilesPage() {
  const { '*': path = '' } = useParams()
  const { t } = useTranslation()
  const currentFolderName = path.match(/([^/]*)\/$/)?.[1] ?? t('root')

  const decrTitle = (p = '') => {
    if (p.match(/!\[([^]+)]\.s3/)?.[1]) {
      return p.match(/!\[([^]+)]\.s3/)?.[1]
    }
    return p
  }

  // TODO: use real parent's path to back
  const pathLength = path.split('/').length
  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      overflow: 'hidden',
      flexDirection: 'column',
    }}
    >

      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          backgroundColor: 'white',
        }}
      >

        <TopBar withBack={pathLength > 1} title={decrTitle(currentFolderName)} />
        <Files />
      </Box>
    </Box>
  )
}
