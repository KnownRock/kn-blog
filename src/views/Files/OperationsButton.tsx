import { Button, ButtonGroup } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { uploadFile as uploadFileToClient } from '../../utils/fs'
import FilesContext from '../../contexts/FilesContext'
import NewFileButton from './NewFileButton'
import InfoContext from '../../contexts/InfoContext'

export default function OperationButton({
  path,
}: {
  path: string;
}) {
  const { refetch } = useContext(FilesContext)
  const { t } = useTranslation()
  const { error } = useContext(InfoContext)

  const uploadFile = async () => {
    uploadFileToClient(path)
      .then(() => refetch())
      .catch((e) => {
        error(e)
      })
  }
  const uploadFolder = async () => {
    uploadFileToClient(path, true)
      .then(() => refetch())
      .catch((e) => {
        error(e)
      })
  }

  return (
    <ButtonGroup variant="contained" aria-label="outlined primary button group">
      <NewFileButton path={path || ''} />

      <Button variant="contained" onClick={uploadFile}>
        {t('Upload')}
      </Button>
      <Button variant="contained" onClick={uploadFolder}>
        {t('Upload folder')}
      </Button>
    </ButtonGroup>
  )
}
