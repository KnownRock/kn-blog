import { Box, Button, IconButton } from '@mui/material'
import useLoading from '../../../contexts/LoadingContext'
import { useDataUrl } from '../../../hooks/fs-hooks'

import Basic from '../Basic'

function ImageViewer({ path }: { path: string }) {
  const { dataUrl, loading, error } = useDataUrl(path || '')

  useLoading(loading)

  if (loading) {
    return <Box>Loading...</Box>
  }
  if (error) {
    return <Box>Error...</Box>
  }
  return (
    <Box sx={{
      flexGrow: 1,
      backgroundImage: `url(${dataUrl})`,
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPositionX: 'center',
      backgroundPositionY: 'center',
    }}
    />
  )
}

export default function ImageViewerPage() {
  return (
    <Basic
      FileViewer={ImageViewer}
    />
  )
}
