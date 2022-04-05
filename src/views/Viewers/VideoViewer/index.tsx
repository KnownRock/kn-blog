import { Box } from '@mui/material'

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
    <Box>
      Working on
      {' '}
      {path}
    </Box>
  )
}

export default function ImageViewerPage() {
  return (
    <Basic
      FileViewer={ImageViewer}
    />
  )
}
