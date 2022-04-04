import * as React from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { Box } from '@mui/material'
import Minio from 'minio'
import { useTranslation } from 'react-i18next'
import { useState, useContext, useEffect } from 'react'
import { renameFile } from '../../utils/fs'
import FilesContext from '../../contexts/FilesContext'

export default function FormDialog({
  open, setOpen,
  object,
}:{
  open: boolean,
  setOpen: (open: boolean) => void,
  object: {
    name: string,
  },
}) {
  const { t } = useTranslation()
  const [value, setValue] = useState(object.name.replace(/^.*\//, ''))
  const { refetch } = useContext(FilesContext)

  const handleOk = () => {
    renameFile(
      object.name,
      `${(`${object.name}`).replace(/\/[^/]*$/, '')}/${value}`,
    )
      .then(() => {
        refetch()
      })
    setOpen(false)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Box>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{t('Rename')}</DialogTitle>
        <DialogContent>

          <TextField
            autoFocus
            margin="dense"
            id="name"
            label={t('New name')}
            type="text"
            fullWidth
            variant="standard"
            value={value}
            onChange={(evt) => setValue(evt.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleOk}>Ok</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
