import {
  Box, Button, CircularProgress,
} from '@mui/material'

import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useContext, useEffect, useState } from 'react'
import TopBar from '../../components/TopBar'

import Files from './Files'
import { useAutoLogin, useLogout, useShowLogin } from '../../hooks/user-hooks'
import FullContainer from './FullContainer'

export default function FilesPage() {
  const { '*': path = '' } = useParams()
  const { t } = useTranslation()

  const currentFolderName = path.match(/([^/]*)\/$/)?.[1] ?? t('root')

  // TODO: use real parent's path to back
  const pathLength = path.split('/').length

  const { loading, success } = useAutoLogin()

  const { showLogin } = useShowLogin()
  const { logout } = useLogout()

  function handleLogin() {
    showLogin()
  }

  function handleLogout() {
    logout()
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
        {
          (!loading)
            ? <Files path={path} />
            : (
              <FullContainer>
                <CircularProgress />
              </FullContainer>
            )
        }
      </Box>
    </Box>
  )
}
