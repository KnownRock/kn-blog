import {
  Box, Button, Fab, IconButton,
} from '@mui/material'
import { useEffect, useState } from 'react'
import InfoIcon from '@mui/icons-material/Info'
import TopBar from '../../components/TopBar'

function Viewer({ FileViewer }: { FileViewer: React.FC<{ path:string }> }) {
  const params = new URLSearchParams(window.location.search)
  // TODO: add a conditions for this
  const path = params.get('path') ?? ''

  const fileName = path.match(/[^/]*$/)?.[0] ?? 'undefined'

  return (
    <Box sx={{
      width: '100wh',
      height: '100vh',

      display: 'flex',
      flexDirection: 'column',
    }}
    >
      <TopBar withBack title={fileName}>
        <IconButton color="inherit">
          <InfoIcon />
        </IconButton>
      </TopBar>

      <FileViewer path={path} />

    </Box>
  )
}

export default Viewer