import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import AddIcon from '@mui/icons-material/Add'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { isExist, newFile } from '../../utils/fs'
import FilesContextRe from '../../contexts/FilesContext'
import InfoContext from '../../contexts/InfoContext'

export default function NewFile({ path }: { path: string; }) {
  const { t } = useTranslation()
  const { refetch } = useContext(FilesContextRe)
  const { info, error } = useContext(InfoContext)

  let fileName = ''

  const handleNewFile = async () => {
    info({
      title: t('files.newFile.title'),
      component: (
        <Input
          defaultValue={path}
          onChange={(e) => {
            fileName = e.target.value
          }}
          fullWidth
          autoFocus
          placeholder={t('files.newFile.placeholder')}
        />
      ),
      async isOk() {
        return isExist(fileName.replace(/\/$/, '')).then((exist) => {
          if (exist) {
            info({
              title: t('Message'),
              content: t('The file or directory already exists'),
            })
            return false
          }
          return true
        })
      },
    }).then(
      () => newFile(`${fileName}`).catch((e) => {
        error(e)
      }),
    ).then(() => {
      refetch()
    })
  }

  return (

    <Button variant="contained" onClick={handleNewFile}>
      <AddIcon />
    </Button>

  )
}
