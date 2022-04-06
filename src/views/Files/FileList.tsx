import { Box, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import FileButton from './FileButton'
import { dir } from '../../utils/fs'

export default function FileList({ objects }: { objects: Awaited<ReturnType<typeof dir>>; }) {
  const { t } = useTranslation()
  const typedObjects = useMemo(() => {
    if (objects) {
      return objects.map((object) => ({
        ...object,
      }))
    }
    return []
  }, [objects])

  const remoteFolderObjects = useMemo(() => typedObjects.filter((object) => object.type === 'remote-folder'), [typedObjects])
  const folderObjects = useMemo(() => typedObjects.filter((object) => object.type === 'folder'), [typedObjects])
  const fileObjects = useMemo(() => typedObjects.filter((object) => object.type === 'file'), [typedObjects])

  const groupedObjects = useMemo(
    () => [{
      title: t('Remote Folders'),
      objects: remoteFolderObjects,
    }, {
      title: t('Folders'),
      objects: folderObjects,
    }, {
      title: t('Files'),
      objects: fileObjects,
    }].filter((group) => group.objects.length > 0),
    [t, remoteFolderObjects, folderObjects, fileObjects],
  )

  return (
    <Box
      sx={{
        paddingLeft: 2,
        paddingRight: 2,
        flexGrow: 1,
      }}
    >
      {groupedObjects.map((group) => (
        <Box key={group.title}>
          <Typography variant="subtitle1" component="h6">{group.title}</Typography>

          <Grid container spacing={2}>
            {group.objects.map((obj) => (
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
                  <FileButton object={obj} />
                </Box>
              </Grid>
            ))}

          </Grid>
        </Box>
      ))}

    </Box>
  )
}
