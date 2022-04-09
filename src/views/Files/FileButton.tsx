import {
  Box, Button, Divider, IconButton, Input, Menu, MenuItem,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import FileIcon from './FileIcon'
import {
  copyFile,
  copyFolder,
  getFileAsDataUrl, isExist, removeDir, removeFile, renameFile, renameFolder,
} from '../../utils/fs'
import FilesContextRe from '../../contexts/FilesContext'
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

  const { info, error } = useContext(InfoContext)
  const { refetch, onOpen, Detail } = useContext(FilesContextRe)
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
    onOpen(object)
  }

  async function handleDownload() {
    const dataUrl = await getFileAsDataUrl(object.name)
    const link = document.createElement('a')

    link.href = dataUrl
    link.download = object.name
    link.click()
  }

  function handleRenameAndCopyTo(submitType:'Rename' | 'Copy to') {
    let newName = object.name

    const submitFunctions: ((oldPath:string, newPath:string) =>Promise<unknown>)[] = ({
      Rename: [renameFile, renameFolder],
      'Copy to': [copyFile, copyFolder],
    })[submitType]

    info({
      title: t(submitType),
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
                title: t(submitType),
                content: t('The file or directory already exists'),
              })
            } else {
              submitFunctions[0](object.name, newName)
                .then(() => refetch())
                .catch(error)
            }
          })
        }
      } else if (object.type === 'folder') {
        if (newName !== object.name) {
          isExist(newName.replace(/\/$/, '')).then((exist) => {
            if (exist) {
              info({
                title: t(submitType),
                content: t('The file or directory already exists'),
              })
            } else {
              submitFunctions[1](object.name, newName)
                .then(() => refetch())
                .catch(error)
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
        removeDir(object.prefix).then(() => refetch()).catch((e) => {
          error(e)
        })
      })
    } else {
      info({
        title: t('file.delete.title'),
        content: t('file.delete.description'),
      }).then(() => {
        removeFile(object.name).then(() => refetch()).catch((e) => {
          error(e)
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
          <MenuItem onClick={() => handleRenameAndCopyTo('Rename')}>{t('Rename')}</MenuItem>
          <MenuItem onClick={() => handleRenameAndCopyTo('Copy to')}>{t('Copy to')}</MenuItem>
          <MenuItem onClick={() => handleRenameAndCopyTo('Rename')}>{t('Delete')}</MenuItem>

          <Divider />
          <MenuItem onClick={handleDownload}>{t('Download')}</MenuItem>

        </Menu>
      )}

      <Button
        onClick={() => handleClick()}
        variant="outlined"
        sx={{
          height: 52,
          width: '100%',
        }}
        startIcon={<FileIcon type={type} />}
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

          {Detail && <Detail object={object} />}

          {/* <Box onMouseDown={(e) => e.stopPropagation()}>
            <IconButton
              color="primary"
              onClick={handleMore}
              aria-label="more"
              component="span"
            >
              <MoreVertIcon />
            </IconButton>

          </Box> */}

        </Box>
      </Button>
    </>
  )
}
