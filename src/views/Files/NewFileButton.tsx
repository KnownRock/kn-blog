import { Button, Input } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import React, { Component, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { newFile } from '../../utils/fs'
import FilesContext from '../../contexts/FilesContext'
import InfoContext from '../../contexts/InfoContext'

export default function NewFile({ path }: { path: string; }) {
  const { t } = useTranslation()
  const { refetch } = useContext(FilesContext)
  const { info } = useContext(InfoContext)

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
    }).then(
      () => newFile(`${fileName}`),
    ).then(() => {
      refetch()
    }).catch((e) => {
      info({
        title: t('files.error'),
        content: t(e.message),
      })
    })
  }

  return (

    <Button variant="contained" onClick={handleNewFile}>
      <AddIcon />
    </Button>

  )
}
