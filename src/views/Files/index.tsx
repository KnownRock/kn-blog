import {
  Box, Button, CircularProgress,
} from '@mui/material'

import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import TopBar from '../../components/TopBar'

import Files from './Files'
import { useAutoLogin, useLogout, useShowLogin } from '../../hooks/user-hooks'
import FullContainer from './FullContainer'
import Detail from './Detail'
import Debounce from '../../components/Debounce'

function Null():JSX.Element {
  return <Box />
}
export default function FilesPage() {
  const { '*': path = '/' } = useParams()
  const { t } = useTranslation()

  const folderPath = path.replace(/((?=^)|(?=\/))[^/]*$/, '')

  const currentFolderName = path.match(/([^/]*)\/$/)?.[1] ?? t('root')

  // TODO: use real parent's path to back
  const pathLength = path.split('/').length

  const { loading, success, env } = useAutoLogin()

  const { showLogin } = useShowLogin()
  const { logout } = useLogout()
  const navigate = useNavigate()

  function handleLogin() {
    showLogin()
  }

  function handleLogout() {
    logout()
  }

  function handleNavigate(p:string) {
    navigate(`/files/${p}`)
  }

  function handleOnOpen(object: {
    name: string,
    type: string,
    displayName: string,
    prefix: string,
    metadata: {
      [key: string]: string
    }
  }) {
    const { type } = object
    if (type === 'folder' || type === 'remote-folder') {
      // FIXME: unify /
      navigate(`/files${object.prefix.startsWith('/') ? '' : '/'}${object.prefix}`)
    }
    if (type === 'file') {
      if (object.name.endsWith('.knb')) {
        navigate(`/article-viewer/${object.name}`)
      } else {
        const contnetType = object.metadata['content-type']
        if (contnetType.startsWith('image/')) {
          navigate(`/image-viewer/${object.name}`)
        } else if (contnetType.startsWith('text/') || contnetType.startsWith('application/json')) {
          navigate(`/text-viewer/${object.name}`)
        } else if (contnetType.startsWith('video/')) {
          navigate(`/video-viewer/${object.name}`)
        } else {
          navigate(`/text-viewer/${object.name}`)
        }
      }
      // navigate(`/pic?bucket=${bucket}&file=${object.name}`)
    }
  }

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
        <TopBar withBack={pathLength > 1} title={(currentFolderName)}>
          {!loading && !success && <Button color="inherit" onClick={handleLogin}>{t('Login')}</Button>}
          {!loading && success && <Button color="inherit" onClick={handleLogout}>{t('Logout')}</Button>}
        </TopBar>

        {loading ? (
          <FullContainer>
            <CircularProgress />
          </FullContainer>
        ) : (
          <Files
            onNavigate={handleNavigate}
            onOpen={handleOnOpen}
            type={env.readOnly ? 'readOnly' : 'browse'}
            Detail={env.readOnly ? Null : Detail}
            path={path}
          />
        )}

        {/* <Box sx={{
          backgroundColor: 'red',
          height: 50,
        }}
        > 5991
          123
        </Box> */}

      </Box>
    </Box>
  )
}
