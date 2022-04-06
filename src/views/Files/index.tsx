import {
  Box, FormControl, FormGroup, FormHelperText, Input, InputLabel, Switch, TextField,
} from '@mui/material'

import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useContext } from 'react'
import TopBar from '../../components/TopBar'

import Files from './Files'
import InfoContext from '../../contexts/InfoContext'

export default function FilesPage() {
  const { '*': path = '' } = useParams()
  const { t } = useTranslation()
  const currentFolderName = path.match(/([^/]*)\/$/)?.[1] ?? t('root')

  const { info } = useContext(InfoContext)

  const config = localStorage.getItem('.root')
  if (!config && false) {
    // endPoint: '127.0.0.1',
    // port: 9000,
    // useSSL: false,
    // accessKey: 'minioadmin',
    // secretKey: 'minioadmin',

    // https://github.com/facebook/react/issues/18178
    setTimeout(() => {
      info({
        title: '12',
        // content: 'No config file found',
        component: (
          <Box>
            <FormGroup>
              <FormControl>
                <InputLabel htmlFor="my-input">Email address</InputLabel>
                <Input id="my-input" aria-describedby="my-helper-text" />
                <FormHelperText id="my-helper-text">We'll never share your email.</FormHelperText>
              </FormControl>
              <FormControl>
                <InputLabel htmlFor="my-input">Email address</InputLabel>
                <Input id="my-input" aria-describedby="my-helper-text" />
                <FormHelperText id="my-helper-text">We'll never share your email.</FormHelperText>
              </FormControl>
            </FormGroup>
          </Box>
        ),
      })

      // FingerprintJS.load().then((fp) => fp.get()).then((result) => {
      //   console.log(result)
      // })
    })

    return <Box />
  }

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
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <TopBar withBack={pathLength > 1} title={(currentFolderName)} />
        <Files path={path} />
      </Box>
    </Box>
  )
}
