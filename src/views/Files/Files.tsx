import { Box, Button, ButtonGroup } from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import FileBreadcrumbs from '../../components/FileBreadcrumbs'
import { useDir } from '../../hooks/fs-hooks'
import { uploadFile as uploadFileToClient } from '../../utils/fs'
import FilesContext from '../../contexts/FilesContext'
import NewFileButton from './NewFileButton'
import LoadingFileList from './LoadingFileList'

export default function Files({ path }: { path: string; }) {
  const { t } = useTranslation()

  const {
    objects: objs, loading, error, refetch,
  } = useDir(`/${path}`)

  const contextValue = useMemo(() => ({
    refetch,
  }), [refetch])

  const uploadFile = async () => {
    await uploadFileToClient(path)
    refetch()
  }
  const uploadFolder = async () => {
    await uploadFileToClient(path, true)
    refetch()
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

            <Button variant="contained" onClick={uploadFile}>
              {t('Upload')}
            </Button>
            <Button variant="contained" onClick={uploadFolder}>
              {t('Upload folder')}
            </Button>
          </ButtonGroup>
        </Box>

      </Box>
      <LoadingFileList objects={objs} loading={loading} error={error} />

    </FilesContext.Provider>
  )
}
