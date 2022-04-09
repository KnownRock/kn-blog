import { Box } from '@mui/material'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import FileBreadcrumbs from '../../components/FileBreadcrumbs'
import { useDir } from '../../hooks/fs-hooks'
import FilesContext from '../../contexts/FilesContext'
import LoadingFileList from './LoadingFileList'
import LoadingOperationsButton from './LoadingOperationsButton'

export default function Files(
  {
    path, type: openType, onOpen, Detail,
  }:
  {
    Detail?: ({ object }: { object: FileInfo }) => JSX.Element
    path: string,
    type: 'browse' | 'selectFile' | 'selectFolder',
    onOpen: (object: {
      name: string,
      type: string,
      displayName: string,
      prefix: string,
      metadata: {
        [key: string]: string
      }
    }) => void
  },
) {
  const {
    objects: objs, loading, error, refetch,
  } = useDir(`/${path}`)

  const contextValue = useMemo(() => ({
    refetch,
    type: openType,
    onOpen,
    Detail,

  }), [refetch, openType, onOpen, Detail])

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
        {openType === 'browse' && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
        }}
        >
          <LoadingOperationsButton path={path} loading={loading} error={error} />
        </Box>
        )}

      </Box>
      <LoadingFileList objects={objs} loading={loading} error={error} />

    </FilesContext.Provider>
  )
}
Files.defaultProps = {
  Detail: () => null,
}
