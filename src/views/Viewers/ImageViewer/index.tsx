import { Box, Button, IconButton } from '@mui/material'
import { useEffect, useState } from 'react'
import { useGetFile } from '../../../hooks/fs-hooks'

import Basic from '../Basic'

function ImageViewer({ path }: { path: string }) {
  const { object, loading, error } = useGetFile(path || '')
  const [dataUrl, setDataUrl] = useState('')
  useEffect(() => {
    if (object) {
      const reader = new FileReader()
      reader.onload = () => {
        setDataUrl(reader.result as string)
      }
      reader.readAsDataURL(object)
    }
  }, [object])

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
