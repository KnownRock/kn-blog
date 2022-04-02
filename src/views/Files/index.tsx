import {
  Box, Button, Card, CardContent, CardHeader, Container, IconButton,
} from '@mui/material'
// import TreeView from '@mui/lab/TreeView'
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
// import ChevronRightIcon from '@mui/icons-material/ChevronRight'
// import TreeItem from '@mui/lab/TreeItem'
import Grid from '@mui/material/Grid'
// import useAxios from 'axios-hooks'
import FolderIcon from '@mui/icons-material/Folder'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import CloudCircleIcon from '@mui/icons-material/CloudCircle'

import { useEffect, useState } from 'react'
import Minio from 'minio'
import TopBar from '../../components/TopBar'

declare const minio: typeof Minio

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

function FileButton({ name, type }: { name: string, type: string }) {
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

function getRandomType() {
  const types = ['folder', 'file', 'cloud']
  return types[Math.floor(Math.random() * types.length)]
}

function Files() {
  // const [buckets, setBuckets] = useState(Array<Minio.BucketItemFromList>())

  useEffect(() => {
    const getBuckets = async () => {
      // create the client
      const mc = new minio.Client({
        endPoint: 'localhost',
        port: 9000,
        useSSL: false,
        accessKey: 'aaaaaaaa',
        secretKey: 'aaaaaaaa',
      })
      // list buckets
      // const res = await mc.listBuckets()
      const stream = await mc.listObjectsV2('private', '/old/')
      const objects = await new Promise((resolve, reject) => {
        const objectsListTemp: Array<Minio.BucketItem> = []
        stream.on('data', (obj) => objectsListTemp.push(obj))
        stream.on('error', reject)
        stream.on('end', () => {
          resolve(objectsListTemp)
        })
      })
      console.log(objects)

      // console.log(res.map((bucket) => bucket.name))

      // setBuckets(res)
    }
    getBuckets()
  }, [])

  // const [{ data, loading, error }, refetch] = useAxios({
  //   method: 'get',
  //   url: 'http://localhost:9000/public',
  //   responseType: 'text',
  // })
  // if (data) {
  //   // console.log(convert.xml2json(data, { compact: true, spaces: 4 }))
  // }

  // console.log(data)

  return (
    <Box sx={{
      // paddingBottom: 3,
      height: '100vh',
      display: 'flex',
      opacity: 0.1,
      // display: 'none',
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
                  <Box>
                    {
                      Array.from({ length: 10 }, (_, i) => (

                        <FileButton key={i} type={getRandomType()} name={`${i}`} />

                      ))
                    }

                  </Box>
                </Grid>
              </Grid>

            </Box>

          </CardContent>
        </Card>

      </Container>
    </Box>
  )
}

export default Files
