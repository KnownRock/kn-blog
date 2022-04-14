import IconButton from '@mui/material/IconButton'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'

import Typography from '@mui/material/Typography'

import { useTranslation } from 'react-i18next'
import BackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import HomeIcon from '@mui/icons-material/Home'

type Props = {
  title?: string,
  withBack?: boolean,
  children?: React.ReactNode,
  withHome?: boolean,
}

const defaultProps = {
  title: undefined,
  withBack: false,
  children: undefined,
  withHome: false,
}

function ResponsiveAppBar({
  title, withBack, withHome, children,
}: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // https://stackoverflow.com/questions/66039933/typescript-types-for-import-meta-env
  const innerTitle = title ?? t(import.meta.env.VITE_APP_TITLE)

  const handleBack = () => {
    navigate(-1)
  }

  const handleHome = () => {
    navigate('/')
  }
  // return <div />

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
        {withHome && (
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={handleHome}
          >
            <HomeIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {innerTitle}
        </Typography>
        {children}
        {!children && (
          <IconButton
            // variant="contained"
            color="inherit"
            size="large"
            onClick={() => navigate('/files')}
          >
            <FolderOpenIcon />
          </IconButton>
        )}

      </Toolbar>
    </AppBar>
  )
}

ResponsiveAppBar.defaultProps = defaultProps
export default ResponsiveAppBar
