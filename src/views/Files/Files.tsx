import { Box } from '@mui/material'
import { useMemo } from 'react'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import FileBreadcrumbs from '../../components/FileBreadcrumbs'
import { useDir } from '../../hooks/fs-hooks'
import FilesContext from '../../contexts/FilesContext'
import LoadingFileList from './LoadingFileList'
import LoadingOperationsButton from './LoadingOperationsButton'

export default function Files({ path }: { path: string; }) {
  // FingerprintJS.load().then((fp) => fp.get()).then((result) => {
  //   console.log(result)
  // })

  const {
    objects: objs, loading, error, refetch,
  } = useDir(`/${path}`)

  const contextValue = useMemo(() => ({
    refetch,
  }), [refetch])

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
          <LoadingOperationsButton path={path} loading={loading} error={error} />
        </Box>

      </Box>
      <LoadingFileList objects={objs} loading={loading} error={error} />

    </FilesContext.Provider>
  )
}
