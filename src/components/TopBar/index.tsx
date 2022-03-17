import { Container } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'

import Toolbar from '@mui/material/Toolbar'

import Typography from '@mui/material/Typography'

function ResponsiveAppBar() {
  return (
    <AppBar position="sticky">
      <Toolbar>
        {/* <Container maxWidth="xl"> */}

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {import.meta.env.VITE_APP_TITLE}
        </Typography>
        {/* </Container> */}
      </Toolbar>
    </AppBar>
  )
}
export default ResponsiveAppBar
