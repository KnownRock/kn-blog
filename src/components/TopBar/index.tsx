import { Button, Container, IconButton } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'

import Toolbar from '@mui/material/Toolbar'

import Typography from '@mui/material/Typography'

import { useTranslation } from 'react-i18next'
import BackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'

type Props = {
  title?: string,
  withBack?: boolean,
  children?: React.ReactNode,
}

const defaultProps = {
  title: undefined,
  withBack: false,
  children: undefined,
}

function ResponsiveAppBar({ title, withBack, children }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // https://stackoverflow.com/questions/66039933/typescript-types-for-import-meta-env
  const innerTitle = title ?? t(import.meta.env.VITE_APP_TITLE)

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <AppBar
      position="sticky"
      sx={{
      }}
    >
      <Toolbar variant="dense">
        {withBack && (
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleBack}
          >
            <BackIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {innerTitle}
        </Typography>
        {children}

      </Toolbar>
    </AppBar>
  )
}

ResponsiveAppBar.defaultProps = defaultProps
export default ResponsiveAppBar
