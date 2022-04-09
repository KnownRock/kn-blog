import { Box, IconButton, Input } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useContext } from 'react'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import InfoContext from '../../contexts/InfoContext'
import {
  copyFile, copyFolder, getFileAsDataUrl, isExist, removeDir, removeFile, renameFile, renameFolder,
} from '../../utils/fs'
import FilesContext from '../../contexts/FilesContext'

export default function Detail({ object }: { object: FileInfo; }) {
  const { menu } = useContext(InfoContext)
  const { info, error } = useContext(InfoContext)
  const { t } = useTranslation()
  const { refetch } = useContext(FilesContext)
  const navigate = useNavigate()

  const { type } = object

  function handleRenameAndCopyTo(submitType: 'Rename' | 'Copy to') {
    let newName = object.name

    const submitFunctions: ((oldPath: string, newPath: string) => Promise<unknown>)[] = ({
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

  async function handleDownload() {
    const dataUrl = await getFileAsDataUrl(object.name)
    const link = document.createElement('a')

    link.href = dataUrl
    link.download = object.name
    link.click()
  }

  const handleDelete = () => {
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
  }

  return (
    <Box onMouseDown={(e) => e.stopPropagation()}>
      <IconButton
        color="primary"
        onClick={(evt: React.MouseEvent<HTMLElement>) => {
          evt.stopPropagation()
          menu({
            anchor: evt.currentTarget,
            width: 320,
            items: [{
              label: t('Delete'),
              onClick: () => {
                handleDelete()
              },
            }, {
              label: t('Edit'),
              onClick: () => {
                navigate(`/text-viewer?path=${object.name}`)
              },
            }, {
              label: t('Rename'),
              onClick: () => {
                handleRenameAndCopyTo('Rename')
              },
            }, {
              label: t('Copy to'),
              onClick: () => {
                handleRenameAndCopyTo('Copy to')
              },
            }, {
              type: 'divider',
            }, {
              label: t('Download'),
              onClick: () => {
                handleDownload()
              },
            }, {
              label: t('Share'),
              onClick: () => {
                // navigate(`/share?path=${object.name}`)
                info({
                  title: t('Share'),
                  content: t('Not implemented'),
                })
              },
            }],
          })
        }}
        aria-label="more"
        component="span"
      >
        <MoreVertIcon />
      </IconButton>

    </Box>
  )
}
