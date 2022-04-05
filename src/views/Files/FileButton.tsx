import {
  Box, Button, IconButton, Input, Menu, MenuItem,
} from '@mui/material'
import Minio from 'minio'
import { useNavigate } from 'react-router-dom'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import FileIcon from './FileIcon'
import {
  copyFile, dir, isExist, removeDir, removeFile, renameFile, renameFolder, stat,
} from '../../utils/fs'
import FilesContext from '../../contexts/FilesContext'
import InfoContext from '../../contexts/InfoContext'

export default function FileButton(
  {
    object,
  }: {
    object: {
      name: string
      type: string
      displayName: string
      prefix: string
      metadata: {
        [key: string]: string
      }
    }
  },
) {
  const { type, displayName: name } = object

  const { info } = useContext(InfoContext)
  const { refetch } = useContext(FilesContext)
  const { t } = useTranslation()
  const navigate = useNavigate()

  // TODO: move this to Info Component
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  function handleEdit() {
    navigate(`/text-viewer?path=${object.name}`)
  }

  function handleClick() {
    // console.log(object)
    if (type === 'folder' || type === 'remote-folder') {
      // FIXME: unify /
      navigate(`/files${object.prefix.startsWith('/') ? '' : '/'}${object.prefix}`)
    }
    if (type === 'file') {
      console.log(object)
      const contnetType = object.metadata['content-type']
      if (contnetType.startsWith('image/')) {
        navigate(`/image-viewer?path=${object.name}`)
      } else if (contnetType.startsWith('text/') || contnetType.startsWith('application/json')) {
        navigate(`/text-viewer?path=${object.name}`)
      } else if (contnetType.startsWith('video/')) {
        navigate(`/video-viewer?path=${object.name}`)
      } else {
        navigate(`/text-viewer?path=${object.name}`)
      }
      // navigate(`/pic?bucket=${bucket}&file=${object.name}`)
    }
  }

  function handleRename() {
    let newName = object.name

    info({
      title: t('Rename'),
      // content: t('Rename the file or directory'),
      component: (
        <Input
          fullWidth
          placeholder="New name"
          defaultValue={object.name}
          autoFocus
          onChange={(e) => {
            newName = e.target.value
          }}
        />
      ),
    }).then(async () => {
      if (object.type === 'file' || object.type === 'remote-folder') {
        if (newName !== object.name) {
          isExist(newName.replace(/\/$/, '')).then((exist) => {
            if (exist) {
              info({
                title: t('Rename'),
                content: t('The file or directory already exists'),
              })
            } else {
              renameFile(object.name, newName).then(() => {
                refetch()
              })
            }
          })
        }
      } else if (object.type === 'folder') {
        if (newName !== object.name) {
          renameFolder(object.name, newName).then(() => {
            refetch()
          })
        }
      }

      // dir(newName.replace(/\/$/, '')).then((objects) => {
      //   // TODO: maybe some overwrite check here, like etag
      //   if (objects.length > 0 && newName !== object.name) {
      //     info({
      //       title: t('Rename'),
      //       content: t('The directory already exists'),
      //     })
      //   } else {
      //     if (newName === object.name) {
      //       return
      //     }

      //     renameFile(object.name, newName).then(() => {
      //       refetch()
      //     })
      //   }
      // })

      // stat(`/${newName}`).then(async (st) => {
      //   if (st && object.name !== newName) {
      //     info({
      //       title: t('Rename'),
      //       content: t('The file or directory already exists'),
      //     })
      //   } else {
      //     renameFile(object.name, newName).then(() => {
      //       refetch()
      //     })
      //   }
      // })
    })

    // renameFile(object.name, object.name.replace(/^.*\//, ''))
    // setOpenRenameDialog(true)
  }

  function handleMore(evt: React.MouseEvent<HTMLAnchorElement>) {
    setAnchorEl(evt.currentTarget)
    evt.stopPropagation()
  }
  const handleDelete: React.MouseEventHandler<HTMLLIElement> = (evt) => {
    if (type === 'folder') {
      info({
        title: t('folder.delete.title'),
        content: t('folder.delete.description'),
      }).then(() => {
        removeDir(object.prefix).then(() => {
          refetch()
        })
      })
    } else {
      info({
        title: t('file.delete.title'),
        content: t('file.delete.description'),
      }).then(() => {
        removeFile(object.name).then(() => {
          refetch()
        })
      })
    }

    evt.stopPropagation()
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      {/* {openRenameDialog
      && (
      <RenameDialog
        object={object}
        open={openRenameDialog}
        setOpen={setOpenRenameDialog}
      />
      )} */}
      {anchorEl && (
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={(e) => e.stopPropagation()}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem
            sx={{
              color: 'red',
            }}
            onClick={handleDelete}
          >
            {t('Delete')}

          </MenuItem>
          <MenuItem onClick={handleEdit}>{t('Edit')}</MenuItem>
          <MenuItem onClick={handleRename}>{t('Rename')}</MenuItem>

          {/* <MenuItem onClick={handleClose}>{t('Download')}</MenuItem> */}
        </Menu>
      )}

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
          overflow: 'hidden',
          maxWidth: '100%',
        }}
        >
          <Box>
            <FileIcon type={type} />
          </Box>
          <Box sx={{
            textTransform: 'none',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          >

            {name}

          </Box>
          <Box onMouseDown={(e) => e.stopPropagation()}>
            <IconButton
              color="primary"
              onClick={handleMore}
              aria-label="more"
              component="span"
            >
              <MoreVertIcon />
            </IconButton>

          </Box>

          {/* </Box> */}

        </Box>
      </Button>
    </>
  )
}
