import {
  MouseEventHandler,
  useCallback, useEffect, useMemo, useState,
} from 'react'

import {
  Alert, Box, Divider, Menu, MenuItem, Snackbar,
} from '@mui/material'
import { v4 as uuidv4 } from 'uuid'
import { useTranslation } from 'react-i18next'
import InfoDialog from './InfoDialog'

import InfoContext, { MenuItemInfo, NotificationOptions } from '../../contexts/InfoContext'

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
      message={typeof options === 'string' ? options : options.message}
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

  const info = useCallback((opts:Options) => new Promise<string>((resolve, reject) => {
    const dialogId = uuidv4()

    setDialogs((oldDialogs) => [
      ...oldDialogs,
      {
        id: dialogId,
        options: opts,
        proms: {
          resolve() {
            closeDialog(dialogId)
            resolve('ok')
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

  const notify = useCallback((
    opts:NotificationOptions,
  ) => new Promise<string>((resolve, reject) => {
    const notificationId = uuidv4()

    setNotifications((oldNotifications) => [
      ...oldNotifications,
      {
        id: notificationId,
        options: opts,
        proms: {
          resolve() {
            closeNotification(notificationId)
            resolve('ok')
          },
          reject(value) {
            closeNotification(notificationId)
            reject(value)
          },
        },
      }])
  }), [closeNotification])

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openMenu, setOpenMenu] = useState(false)
  const [menuItems, setMenuItems] = useState<Array<MenuItemInfo>>([])
  const [width, setWidth] = useState(320)

  function handleCloseMenu() {
    setOpenMenu(false)
  }
  const infoContext = useMemo(() => ({
    info,
    error(e:Error) {
      return info({
        title: t('Error'),
        content: t(e.message),
      })
    },
    notify,
    menu(opts:{
      anchor: HTMLElement,
      items:MenuItemInfo[]
      width?:number,
    }) {
      setWidth(opts.width || 320)
      setAnchorEl(opts.anchor)
      setOpenMenu(true)
      setMenuItems(opts.items.map((item) => ({
        ...item,
        onClick: (e) => {
          if (item.type !== 'divider') {
            item.onClick(e)
            handleCloseMenu()
          }
        },
      })))
      return new Promise<string>((resolve) => {
        resolve('ok')
      })
    },
  }), [info, notify, t])

  return (
    <>
      <Box>
        {dialogs.map((dialog) => (
          <Dialog key={dialog.id} proms={dialog.proms} options={dialog.options} />
        ))}

        {notifications.map((notification) => (
          <CustomSnackBar
            key={notification.id}
            proms={notification.proms}
            options={notification.options}
          />
        ))}

        {anchorEl && (
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleCloseMenu}
          onClick={(e) => e.stopPropagation()}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          {menuItems.map((item) => (
            item.type !== 'divider'
              ? (
                <MenuItem
                  sx={{ width }}
                  key={uuidv4()}
                  onClick={item.onClick}
                >
                  {item.label}
                </MenuItem>
              )
              : (<Divider sx={{ width }} key={uuidv4()} />)
          ))}

        </Menu>
        )}

      </Box>
      <InfoContext.Provider value={infoContext}>
        {children}
      </InfoContext.Provider>
    </>
  )
}
