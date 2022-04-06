import { Box } from '@mui/material'

import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import TopBar from '../../components/TopBar'

import Files from './Files'

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
        <TopBar withBack={pathLength > 1} title={(currentFolderName)} />
        <Files path={path} />
      </Box>
    </Box>
  )
}
