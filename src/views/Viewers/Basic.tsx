import {
  Box, Button, Fab, IconButton, Input, TextField,
} from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import InfoIcon from '@mui/icons-material/Info'
import { t } from 'i18next'
import { useParams } from 'react-router-dom'
import pathUtils from 'path'
import TopBar from '../../components/TopBar'
import { useAutoLogin } from '../../hooks/user-hooks'
import { stat } from '../../utils/fs'
import InfoContext from '../../contexts/InfoContext'

function Viewer({ FileViewer }: { FileViewer: React.FC<{
  path:string, readOnly:boolean, setTitle?:(title:string)=>void }> }) {
  const params = new URLSearchParams(window.location.search)
  // TODO: add a conditions for this
  const [title, setTitle] = useState('')
  const { '*': path = '/' } = useParams()// params.get('path') ?? ''

  const fileName = pathUtils.basename(path).replace(/\.[^.]*$/, '') // path.match(/[^/]*$/)?.[0] ?? 'undefined'
  const { loading, success, env } = useAutoLogin()

  const { info } = useContext(InfoContext)

  async function handleDetails() {
    const s = await stat(path)
    info({
      title: path,
      component: (
        <>
          <Box sx={{
            padding: '10px 0',
          }}
          >
            <TextField fullWidth variant="standard" label={t('File size')} value={`${(s.size / 1024 / 1024).toFixed(3)}MB`} disabled />
          </Box>

          <Box sx={{
            padding: '10px 0',
          }}
          >
            <TextField
              fullWidth
              variant="standard"
              label={t('LastModified')}
              value={s.lastModified.toLocaleString()}
              disabled
            />
          </Box>
        </>

      ),
    })
  }

  return (
    <Box sx={{
      width: '100wh',
      height: '100vh',

      display: 'flex',
      flexDirection: 'column',
    }}
    >
      <TopBar withBack title={title || fileName}>
        <IconButton color="inherit" onClick={handleDetails}>
          <InfoIcon />
        </IconButton>
      </TopBar>

      {!loading && <FileViewer setTitle={setTitle} readOnly={!!env.readOnly} path={path} />}

    </Box>
  )
}

export default Viewer
