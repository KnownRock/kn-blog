import {
  useCallback, useContext, useEffect, useMemo, useState,
} from 'react'

import {
  Alert, Box, Button, Grow, Snackbar,
} from '@mui/material'
import { v4 as uuidv4 } from 'uuid'
import { useTranslation } from 'react-i18next'
import { SnackbarProvider, VariantType, useSnackbar } from 'notistack'
import InfoDialog from './InfoDialog'

import InfoContext from '../../contexts/InfoContext-with-notistack'

type Options = {
  title?: string
  content?: string,
  component?: React.ReactNode,
}

function Dialog({ proms, options }: {
  proms: {
    resolve: (value:unknown) => void,
    reject: (value:unknown) => void,
  }
  options: Options
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(true)
  }, [])

  return <InfoDialog open={open} setOpen={setOpen} options={options} proms={proms} />
}

function Info({
  children,
}:{
  children: React.ReactNode,
}) {
  const [dialogs, setDialogs] = useState<({
    id:string,
    options: Options,
    proms: {
      resolve:(value:unknown) => void,
      reject: (value:unknown) => void,
    },
  })[]>([])

  const { enqueueSnackbar } = useSnackbar()

  const { t } = useTranslation()

  const closeDialog = useCallback((dialogId:string) => {
    setTimeout(() => {
      setDialogs((oldDialogs) => oldDialogs.filter((dialog) => dialog.id !== dialogId))
    }, 500)
  }, [])

  const info = useCallback((opts:Options) => new Promise((resolve, reject) => {
    const dialogId = uuidv4()

    setDialogs((oldDialogs) => [
      ...oldDialogs,
      {
        id: dialogId,
        options: opts,
        proms: {
          resolve(value) {
            closeDialog(dialogId)
            resolve(value)
          },
          reject(value) {
            closeDialog(dialogId)
            reject(value)
          },
        },
      }])
  }), [closeDialog])

  const { notify: notifyA } = useContext(InfoContext)
  type NotifyOptions = Parameters <typeof notifyA>[0]

  const notify = useCallback(({ message, options }:NotifyOptions) => {
    enqueueSnackbar(message, options)
  }, [enqueueSnackbar])

  const infoContext = useMemo(() => ({
    info,
    error(e:Error) {
      return info({
        title: t('Error'),
        content: t(e.message),
      })
    },
    notify,
  }), [info, t, notify])

  return (
    <>
      <Box>
        {dialogs.map((dialog) => (
          <Dialog key={dialog.id} proms={dialog.proms} options={dialog.options} />
        ))}

      </Box>
      <InfoContext.Provider value={infoContext}>
        {children}
      </InfoContext.Provider>
    </>
  )
}

export default function InfoWithSnackbar({
  children,
}:{
  children: React.ReactNode
}) {
  return (
    <SnackbarProvider maxSnack={3}>
      <Info>
        {children}
      </Info>
    </SnackbarProvider>
  )
}
