import {
  Box, Button, CircularProgress, Grid, LinearProgress, Skeleton, Typography,
} from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import FilesContext from '../../contexts/FilesContext'
import FileList from './FileList'
import FullContainer from './FullContainer'

function LoadingInfo({ loading, error }: { loading: boolean; error: boolean; }) {
  const { t } = useTranslation()
  const { refetch } = useContext(FilesContext)

  if (loading) {
    return (
      <>
        <Typography variant="h5" component="h5">{t('Loading')}</Typography>
        <Button onClick={refetch} variant="contained" color="primary">
          {t('Refresh')}
        </Button>
      </>
    )
  }
  if (error) {
    return (
      <>
        <Typography variant="h5" component="h5">{t('Error')}</Typography>
        <Button onClick={refetch} variant="contained" color="primary">
          {t('Refresh')}
        </Button>
      </>
    )
  }
  return <Box />
}

export default function LoadingFileList({
  loading, error, objects,
}: {
  loading: boolean;
  error: boolean;
  objects: Array<FileInfo>;
}) {
  // TODO: make better transition such as debounce
  const [isShowing, setIsShowing] = useState(false)

  useEffect(() => {
    // TODO: move time to .env
    setTimeout(() => {
      setIsShowing(true)
    }, 200)
  }, [loading])

  if (isShowing && loading && !objects.length) {
    return (
      <LinearProgress />

    // <FullContainer>
    //   {/* <LoadingInfo loading={loading} error={error} /> */}
    //   <CircularProgress />
    // </FullContainer>
    )
  }
  if (isShowing && error) {
    return (
      <FullContainer>
        <LoadingInfo loading={loading} error={error} />
      </FullContainer>
    )
  }

  return <FileList objects={objects} />
}
