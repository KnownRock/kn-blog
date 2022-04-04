import { Box, Button, IconButton } from '@mui/material'
import { useEffect, useState } from 'react'
import { useGetFile } from '../../../hooks/fs-hooks'

import Basic from '../Basic'

function ImageViewer({ path }: { path: string }) {
  // const { object, loading, error } = useGetObject(bucket || '', file || '')

  // if (loading) {
  //   return <Box>Loading...</Box>
  // }
  // if (error) {
  //   return <Box>Error...</Box>
  // }

  return (
    // <video srcObject={object} controls />
    <Box>Working on</Box>
  )
}

export default function ImageViewerPage() {
  return (
    <Basic
      FileViewer={ImageViewer}
    />
  )
}
