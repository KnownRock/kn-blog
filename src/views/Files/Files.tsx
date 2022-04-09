import { Box } from '@mui/material'
import { useCallback, useContext, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import FileBreadcrumbs from '../../components/FileBreadcrumbs'
import { useDir } from '../../hooks/fs-hooks'
import FilesContextRe from '../../contexts/FilesContext'
import LoadingFileList from './LoadingFileList'
import LoadingOperationsButton from './LoadingOperationsButton'
import { uploadDropedFileList } from '../../utils/fs'
import InfoContext from '../../contexts/InfoContext'

export default function Files(
  {
    path, type: openType, onOpen, Detail, onNavigate,
  }:
  {
    onNavigate: (path: string) => void,
    Detail?: ({ object }: { object: FileInfo }) => JSX.Element
    path: string,
    type: 'browse' | 'selectFile' | 'selectFolder' | 'readOnly'
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
  const { error: showError } = useContext(InfoContext)
  const contextValue = useMemo(() => ({
    refetch,
    type: openType,
    onOpen,
    Detail,
    onNavigate,

  }), [refetch, openType, onOpen, Detail, onNavigate])

  const onDrop = useCallback((acceptedFiles) => {
    if (openType === 'browse') {
      uploadDropedFileList(path, acceptedFiles)
        .then(() => {
          refetch()
        })
        .catch(showError)
    }
  }, [openType, path, refetch, showError])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  })

  function hideFiles(files:FileInfo[]) {
    if (files) {
      return files.filter((el) => {
        if (openType === 'readOnly') {
          if (el.name === '.env') {
            return false
          }
        }
        return true
      })
    }
    return []
  }

  return (
    <FilesContextRe.Provider value={contextValue}>
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
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...getRootProps()}

      >

        {
          // eslint-disable-next-line react/jsx-props-no-spreading
          <input {
            ...getInputProps()
          }
          />
        }

        <LoadingFileList objects={hideFiles(objs)} loading={loading} error={error} />
      </Box>

    </FilesContextRe.Provider>
  )
}
Files.defaultProps = {
  Detail: () => null,
}
