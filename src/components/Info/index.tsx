import {
  useCallback, useEffect, useMemo, useState,
} from 'react'

import { Alert, Box, Snackbar } from '@mui/material'
import { v4 as uuidv4 } from 'uuid'
import { useTranslation } from 'react-i18next'
import InfoDialog from './InfoDialog'

import InfoContext from '../../contexts/InfoContext'

type Options = {
  title?: string
  content?: string,
  component?: React.ReactNode,
}

type NotificationOptions = {
  message?: string,
  timeout?: number,
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

function CustomSnackBar({ proms, options }: {
  proms: {
    resolve: (value:unknown) => void,
    reject: (value:unknown) => void,
  }
  options: NotificationOptions
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(true)
  }, [])

  function handleClose() {
    setOpen(false)
    proms.resolve('ok')
  }

  return (
    <Snackbar
      open={open}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      message={options.message}
      onClose={handleClose}
    />
  )
}

export default function Info({
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

  const [notifications, setNotifications] = useState<({
    id:string,
    options: NotificationOptions,
    proms: {
      resolve:(value:unknown) => void,
      reject: (value:unknown) => void,
    },
  })[]>([])

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

  const closeNotification = useCallback((notificationId:string) => {
    setTimeout(() => {
      setNotifications(
        (oldNotifications) => oldNotifications
          .filter((notification) => notification.id !== notificationId),
      )
    }, 500)
  }, [])

  const notify = useCallback((opts:NotificationOptions) => new Promise((resolve, reject) => {
    const notificationId = uuidv4()

    setNotifications((oldNotifications) => [
      ...oldNotifications,
      {
        id: notificationId,
        options: opts,
        proms: {
          resolve(value) {
            closeNotification(notificationId)
            resolve(value)
          },
          reject(value) {
            closeNotification(notificationId)
            reject(value)
          },
        },
      }])
  }), [closeNotification])

  // const [options, setOptions] = useState<{
  //   title?: string,
  //   content?: string,

  //   component?: React.ReactNode,
  // }>({})
  // const [proms, setProms] = useState<{
  //   resolve:(value:unknown) => void,
  //   reject:(value:unknown) => void,
  // }>({ resolve: () => {}, reject: () => {} })

  // const info = (opts:Options) => new Promise((resolve, reject) => {
  //   setOptions(opts)
  //   setOpen(true)
  //   setProms({
  //     resolve,
  //     reject,
  //   })
  // })

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

        {/* <Box> */}
        {notifications.map((notification) => (
          <CustomSnackBar
            key={notification.id}
            proms={notification.proms}
            options={notification.options}
          />
        ))}
        {/* </Box> */}

      </Box>
      <InfoContext.Provider value={infoContext}>
        {children}
      </InfoContext.Provider>
    </>
  )
}
