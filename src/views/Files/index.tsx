import {
  Box, Button, Card, CardContent, CardHeader, Container, IconButton, SxProps, Theme,
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
import { useParams, useNavigate } from 'react-router-dom'
import TopBar from '../../components/TopBar'
import FileBreadcrumbs from '../../components/FileBreadcrumbs'

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

function FileButton({ object }: { object: Minio.BucketItem }) {
  const navigate = useNavigate()
  const type = object.name?.endsWith('/') || object.prefix?.endsWith('/') ? 'folder' : 'file'
  const name = object.name?.replace(/\/$/, '').replace(/^.*\//, '') || object.prefix?.replace(/\/$/, '').replace(/^.*\//, '')

  function handleClick() {
    // console.log(object)
    if (type === 'folder') {
      navigate(`/files/${object.prefix}`)
    }
  }

  return (
    <Button
      onClick={() => handleClick()}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        width: '100%',
        // margin: 2,

      }}
    >
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        // padding: 2,

      }}
      >
        <Box>
          <FileIcon type={type} />
        </Box>

        <Box sx={{
          textTransform: 'none',
          fontSize: '0.8rem',
          fontWeight: 'bold',

        }}
        >
          {name}
        </Box>
      </Box>
    </Button>
  )
}

function useListObjects(bucket: string, prefix: string) {
  const [objects, setObjects] = useState([] as Array<Minio.BucketItem>)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const mc = new minio.Client({
          endPoint: '192.168.199.252',
          port: 9000,
          useSSL: false,
          accessKey: 'minioadmin',
          secretKey: 'minioadmin',
        })
        const stream = await mc.extensions.listObjectsV2WithMetadata(bucket, prefix)
        const objs = await new Promise<Array<Minio.BucketItem>>((resolve, reject) => {
          const objectsListTemp: Array<Minio.BucketItem> = []
          stream.on('data', (obj) => objectsListTemp.push(obj))
          stream.on('error', reject)
          stream.on('end', () => {
            resolve(objectsListTemp)
          })
        })
        setObjects(objs)
        setLoading(false)
      } catch (e) {
        setError(true)
      }
    })()
  }, [bucket, prefix])

  return { objects, loading, error }
}

function Files() {
  const { '*': path } = useParams()

  const { objects, loading, error } = useListObjects('private', `/${path}`)
  console.log(objects)

  return (
    <Box sx={{
      // paddingBottom: 3,
      height: '100vh',
      display: 'flex',
      // opacity: 0.1,
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
          overflow: 'hidden',
        }}
      >
        <Card sx={{
          height: '100%',
          overflow: 'auto',
        }}
        >
          <CardContent>
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 1,
                backgroundColor: 'white',
                padding: 1,
              }}
            >
              <FileBreadcrumbs path={path || ''} />
            </Box>
            <Box>
              <Grid container spacing={2}>
                {
                  objects.map((obj) => (
                    <Grid
                      key={obj.name || obj.prefix}
                      item
                      xs={12}
                      sm={4}
                      md={3}
                      lg={3}
                      xl={3}
                    >
                      <Box>
                        <FileButton
                          object={obj}
                        />
                      </Box>
                    </Grid>
                  ))
                }

              </Grid>

            </Box>

          </CardContent>
        </Card>

      </Container>
    </Box>
  )
}

export default Files
