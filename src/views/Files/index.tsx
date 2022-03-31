import {
  Box, Card, CardContent, CardHeader, Container,
} from '@mui/material'
import TreeView from '@mui/lab/TreeView'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import TreeItem from '@mui/lab/TreeItem'
import Grid from '@mui/material/Grid'
import TopBar from '../../components/TopBar'

const Item = Box
function Home() {
  return (
    <Box sx={{ paddingBottom: 3 }}>
      <TopBar />
      <Container
        maxWidth="xl"
        sx={{
          padding: {
            xs: 0,
            sm: 0,
            md: 4,

          },
        }}
      >
        <Card>
          <CardContent>
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Item>xs=12 md=8</Item>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Item>xs=6 md=4</Item>
                </Grid>
              </Grid>

              {/* <TreeView
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
              </TreeView> */}
            </Box>

          </CardContent>
        </Card>

      </Container>
    </Box>
  )
}

export default Home
