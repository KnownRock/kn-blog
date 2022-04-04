import {
  Box, Button, ButtonGroup, Input, Typography,
} from '@mui/material'
// import TreeView from '@mui/lab/TreeView'
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
// import ChevronRightIcon from '@mui/icons-material/ChevronRight'
// import TreeItem from '@mui/lab/TreeItem'
import Grid from '@mui/material/Grid'
import AddIcon from '@mui/icons-material/Add'

// import useAxios from 'axios-hooks'

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
import { newFile, uploadFile as uploadFileToClient } from '../../utils/fs'

import FilesContext from '../../contexts/FilesContext'

import InfoContext from '../../contexts/InfoContext'

type DiredFile = {
  name: string
  type: 'file' | 'folder' | 'remote-folder'
  displayName: string,
  prefix: string,
}

function NewFile({ path }:{ path:string }) {
  const { t } = useTranslation()
  const { refetch } = useContext(FilesContext)
  const { info } = useContext(InfoContext)

  let fileName = ''

  const handleNewFile = async () => {
    info({
      title: t('files.newFile.title'),
      component: (
        <Input
          defaultValue={path}
          onChange={(e) => {
            fileName = e.target.value
          }}
          fullWidth
          placeholder={t('files.newFile.placeholder')}
        />
      ),
    }).then(async () => {
      newFile(`/${fileName}`).then(() => {
        refetch()
      })
    })
  }

  return (
    <Button variant="contained" onClick={handleNewFile}>
      <AddIcon />
    </Button>
  )
}

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
            <NewFile path={path || ''} />
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

        {remoteFolderObjects.length ? (
          <Box>
            <Typography variant="subtitle1" component="h6">{t('Remote Folders')}</Typography>

            <Grid container spacing={2}>
              {
            remoteFolderObjects.map((obj) => (
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
        ) : null}

        {folderObjects.length ? (
          <Box>
            <Typography variant="subtitle1" component="h6">{t('Folders')}</Typography>

            <Grid container spacing={2}>
              {
            folderObjects.map((obj) => (
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
        ) : null}

        {fileObjects.length ? (
          <Box>
            <Typography variant="subtitle1" component="h6">{t('Files')}</Typography>
            <Grid container spacing={2}>
              {
              fileObjects.map((obj) => (
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
        ) : null}

      </Box>
    </FilesContext.Provider>
  )
}

export default function FilesPage() {
  const { '*': path = '' } = useParams()
  const { t } = useTranslation()
  const currentFolderName = path.match(/([^/]*)\/$/)?.[1] ?? t('root')

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

        <TopBar withBack={pathLength > 1} title={currentFolderName} />
        <Files />
      </Box>
    </Box>
  )
}
