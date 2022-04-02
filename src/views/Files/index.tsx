import {
  Box, Button, Card, CardContent, CardHeader, Container, IconButton,
} from '@mui/material'
import TreeView from '@mui/lab/TreeView'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import TreeItem from '@mui/lab/TreeItem'
import Grid from '@mui/material/Grid'

import FolderIcon from '@mui/icons-material/Folder'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import CloudCircleIcon from '@mui/icons-material/CloudCircle'
import TopBar from '../../components/TopBar'

function FileIcon({ type }:{ type: string }) {
  switch (type) {
    case 'folder':
      return <FolderIcon fontSize="large" />
    case 'file':
      return <InsertDriveFileIcon fontSize="large" />
    case 'cloud':
      return <CloudCircleIcon fontSize="large" />
    default:
      return <InsertDriveFileIcon fontSize="large" />
  }
}

function FileButton({ name, type }:{
  name: string,
  type: string
}) {
  return (
    <Button>
      <Box>
        <FileIcon type={type} />
        <Box sx={{
          textTransform: 'none',
        }}
        >
          {name}
        </Box>
      </Box>
    </Button>
  )
}

const Item = Box
function Home() {
  return (
    <Box sx={{
      // paddingBottom: 3,
      height: '100vh',
      display: 'flex',
      overflow: 'hidden',
      flexDirection: 'column',
    }}
    >
      <TopBar />
      <Container
        maxWidth="xl"
        sx={{
          padding: {
            xs: 0,
            sm: 0,
            md: 4,

          },
          flexGrow: 1,
        }}
      >
        <Card>
          <CardContent>
            <Box>
              <Grid container spacing={2}>
                {/* <Grid item xs={12} md={4}>
                  <Item>
                    <TreeView
                      aria-label="file system navigator"
                      defaultCollapseIcon={<ExpandMoreIcon />}
                      defaultExpandIcon={<ChevronRightIcon />}
                      sx={{
                        // height: 240, flexGrow: 1, maxWidth: 400, overflowY: 'auto',
                      }}
                    >
                      <TreeItem nodeId="1" label="Applications">
                        <TreeItem nodeId="2" label="Calendar" />
                      </TreeItem>
                      <TreeItem nodeId="5" label="Documents">
                        <TreeItem nodeId="10" label="OSS" />
                        <TreeItem nodeId="6" label="MUI">
                          <TreeItem nodeId="8" label="index.js" />
                        </TreeItem>
                      </TreeItem>
                    </TreeView>
                  </Item>
                </Grid> */}
                <Grid item xs={12} md={8}>
                  <Item>
                    <Box>
                      {
                        Array.from({ length: 10 }, (_, i) => (
                          <FileButton type={i < 4 ? 'folder' : (i > 6 ? '' : 'cloud')} key={i} name={`${i}`} />
                        ))
                      }

                    </Box>
                  </Item>
                </Grid>
              </Grid>

            </Box>

          </CardContent>
        </Card>

      </Container>
    </Box>
  )
}

export default Home
