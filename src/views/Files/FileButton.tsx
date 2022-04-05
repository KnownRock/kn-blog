import {
  Box, Button, Divider, IconButton, Input, Menu, MenuItem,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import FileIcon from './FileIcon'
import {
  getFileAsDataUrl, isExist, removeDir, removeFile, renameFile, renameFolder,
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

  async function handleDownload() {
    const dataUrl = await getFileAsDataUrl(object.name)
    const link = document.createElement('a')

    link.href = dataUrl
    link.download = object.name
    link.click()
  }

  function handleRename() {
    let newName = object.name

    info({
      title: t('Rename'),
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
          isExist(newName.replace(/\/$/, '')).then((exist) => {
            if (exist) {
              info({
                title: t('Rename'),
                content: t('The file or directory already exists'),
              })
            } else {
              renameFolder(object.name, newName).then(() => {
                refetch()
              })
            }
          })
        }
      }
    })
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
              width: 320,
            }}
            onClick={handleDelete}
          >
            {t('Delete')}

          </MenuItem>
          <MenuItem onClick={handleEdit}>{t('Edit')}</MenuItem>
          <MenuItem onClick={handleRename}>{t('Rename')}</MenuItem>
          <Divider />
          <MenuItem onClick={handleDownload}>{t('Download')}</MenuItem>

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
