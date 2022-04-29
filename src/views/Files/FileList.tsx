import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import { useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import FileButton from './FileButton'
import { dir } from '../../utils/fs'
import FilesContextRe from '../../contexts/FilesContext'

export default function FileList({ objects }: { objects: Awaited<ReturnType<typeof dir>>; }) {
  const { t } = useTranslation()
  const { type: openType } = useContext(FilesContextRe)
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
      id: 'remote-folders',
      title: t('Remote Folders'),
      objects: remoteFolderObjects,
    }, {
      id: 'folders',
      title: t('Folders'),
      objects: folderObjects,
    }, {
      id: 'files',
      title: t('Files'),
      objects: fileObjects,
    }].filter((group) => group.objects.length > 0)
      .filter((group) => {
        if (openType === 'selectFolder') {
          if (group.id === 'files') {
            return false
          }
        }
        return true
      }),

    [t, remoteFolderObjects, folderObjects, fileObjects, openType],
  )

  return (
    <Box
      sx={{
        paddingLeft: 2,
        paddingRight: 2,
        flexGrow: 1,

        // backgroundColor: 'red',
      }}

    >

      {groupedObjects.map((group) => (

        <Box key={group.title}>
          <Typography
            sx={{
              padding: 2,
            }}
            variant="subtitle2"
            component="h6"
          >
            {group.title}
          </Typography>
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
