import * as React from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { useTranslation } from 'react-i18next'

export default function AlertDialog({
  open, setOpen, proms,
  options,
}:{
  open: boolean,
  setOpen: (open: boolean) => void,
  proms: {
    reject: (value:unknown) => void,
    resolve: (value:unknown) => void,
  },
  options?: {
    title?: string,
    content?: string,
    component?: React.ReactNode,
    noClose?: boolean,
    isOk?:()=>boolean,
  }
}) {
  const handleClose = () => {
    if (options?.noClose) return
    setOpen(false)
    proms.reject('cancel')
  }
  const handleOk = () => {
    if (!options?.isOk || options.isOk()) {
      setOpen(false)
      proms.resolve('ok')
    }
  }
  const { t } = useTranslation()

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      {options && options.title ? (
        <DialogTitle id="alert-dialog-title">
          {options.title}
        </DialogTitle>
      ) : null}
      {options && options.content ? (
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {options.content}
          </DialogContentText>
        </DialogContent>
      ) : null}
      {options && options.component ? (
        <DialogContent>
          {options.component}
        </DialogContent>
      ) : null}

      <DialogActions>
        {!options?.noClose && <Button onClick={handleClose}>{t('Cancel')}</Button>}
        <Button onClick={handleOk} autoFocus>
          {t('Ok')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
AlertDialog.defaultProps = {
  options: {
    title: '',
    content: '',
  },
}
