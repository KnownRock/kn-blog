import { Box, IconButton, Input } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SetStateAction, useContext, useState } from 'react'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import pathUtils from 'path'
import InfoContext from '../../contexts/InfoContext'
import {
  copyFile, copyFolder, getFileAsDataUrl, isExist, removeDir, removeFile, renameFile, renameFolder,
} from '../../utils/fs'
import FilesContextRe from '../../contexts/FilesContext'
import Files from './Files'

function FolderSelector({ onSelect, nowPath, type }:{
  onSelect: (path: string) => void;
  nowPath: string;
  type: 'folder' | 'file';
}) {
  const [path, setPath] = useState(nowPath.replace(/((?<=\/)|(?<=^))[^/]*$/, ''))
  const [filePath, setFilePath] = useState(nowPath)
  const oldFileName = type === 'file'
    ? nowPath.match(/((?<=\/)|(?<=^))[^/]*$/)?.[0] ?? ''
    : ''

  const [fileName, setFileName] = useState(oldFileName)

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const fPath = e.target.value

    setPath(fPath.replace(/((?<=\/)|(?<=^))[^/]*$/, ''))
    setFilePath(fPath)
    if (type === 'file') {
      setFileName(fPath.match(/((?<=\/)|(?<=^))[^/]*$/)?.[0] ?? '')
    }

    onSelect(fPath)
  }

  function handleNavigate(p:string) {
    const px = p === '' ? '' : `${p}/`
    setPath(px)
    setFilePath(`${px}${fileName}`)
  }

  function handleOnOpen(object: { name: SetStateAction<string> }) {
    setPath(`${object.name}/`)
    setFilePath(`${object.name}/${fileName}`)

    onSelect(`${object.name}/${fileName}`)
  }

  return (
    <Box>
      <Box sx={{
        height: '50vh',
      }}
      >
        <Files
          onNavigate={handleNavigate}
          path={path}
          type="selectFolder"
          onOpen={handleOnOpen}
        />

      </Box>
      <Box>
        <Input
          fullWidth
          value={filePath}
          onChange={handleInput}
        />
      </Box>
    </Box>
  )
}
export default function Detail({ object }: { object: FileInfo; }) {
  const { menu } = useContext(InfoContext)
  const { info, error } = useContext(InfoContext)
  const { t } = useTranslation()
  const { refetch } = useContext(FilesContextRe)
  const navigate = useNavigate()

  const { type } = object

  function handleRenameAndCopyTo(submitType: 'Move to' | 'Copy to') {
    let newName = object.name
    const submitFunctions: ((oldPath: string, newPath: string) => Promise<unknown>)[] = ({
      'Move to': [renameFile, renameFolder],
      'Copy to': [copyFile, copyFolder],
    })[submitType]

    info({
      title: t(`${submitType} file`),
      component: (
        <FolderSelector type="file" onSelect={(fp) => { newName = fp }} nowPath={newName} />
      ),
      noBlur: true,

      isOk: async () => {
        if (newName.endsWith('/')) {
          info({
            title: t('Message'),
            content: t('Please input a valid name'),
          })
          return false
        }
        if (object.type === 'file' || object.type === 'remote-folder') {
          if (newName !== object.name) {
            return isExist(newName).then((exist) => {
              if (exist) {
                info({
                  title: t(submitType),
                  content: t('The file or directory already exists'),
                })
                return false
              }
              return submitFunctions[0](object.name, newName)
                .then(() => true)
                .catch((e) => {
                  error(e)
                  return false
                })
            })
          }
        } else if (object.type === 'folder') {
          if (newName !== object.name) {
            isExist(newName).then((exist) => {
              if (exist) {
                info({
                  title: t(submitType),
                  content: t('The file or directory already exists'),
                })
                return false
              }
              return submitFunctions[1](object.name, newName)
                .then(() => true)
                .catch((e) => {
                  error(e)
                  return false
                })
            })
          }
        }
        return true
      },

    })
    // return

    // info({
    //   title: t(submitType),
    //   component: (
    //     <Input
    //       fullWidth
    //       placeholder="New name"
    //       defaultValue={object.name}
    //       autoFocus
    //       onChange={(e) => {
    //         newName = e.target.value
    //       }}
    //     />
    //   ),
    // })
      .then(async () => {
        refetch()
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
              label: t('Move to'),
              onClick: () => {
                handleRenameAndCopyTo('Move to')
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
