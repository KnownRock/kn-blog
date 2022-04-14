import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import Debounce from '../../components/Debounce'
import FilesContextRe from '../../contexts/FilesContext'
import FileList from './FileList'
import FullContainer from './FullContainer'

function LoadingInfo({ loading, error }: { loading: boolean; error: boolean; }) {
  const { t } = useTranslation()
  const { refetch } = useContext(FilesContextRe)

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
  return (
    <Debounce
      loading={loading}
      error={error}
      loadingChildren={(
        <>
          <LinearProgress />
          <FullContainer>
            <LoadingInfo loading={loading} error={error} />
          </FullContainer>
        </>
      )}
      errorChildren={(
        <FullContainer>
          <LoadingInfo loading={loading} error={error} />
        </FullContainer>
      )}

    >
      <FileList objects={objects} />
    </Debounce>
  )
}
