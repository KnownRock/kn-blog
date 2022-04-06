import { Box, Typography } from '@mui/material'
import OperationsButton from './OperationsButton'

// TODO: refact this to a component
export default function LoadingFileList({
  loading, error, path,
}: {
  loading: boolean;
  error: boolean;
  path: string;
}) {
  // TODO: make better transition
  if (loading) {
    return <Box />
  }
  // debugger
  if (error) {
    return (
      <Box />
    )
  }

  return <OperationsButton path={path} />
}
