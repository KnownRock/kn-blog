import { OptionsObject } from 'notistack'
import React from 'react'

type Options = {
  title?: string
  content?: string
  component?: React.ReactNode,
  noClose?: boolean,
  isOk?:()=>Promise<boolean>,
}

type NotificationOptions = {
  message?: string,
  options?:OptionsObject
}

export default React.createContext({
  info: (opts:Options) => new Promise((res, rej) => {
    const error = new Error(`You must implement confirm function.[${JSON.stringify(opts)}]`)
    rej(error)
  }),

  error: (error:Error) => new Promise((res, rej) => {
    const e = new Error(`You must implement confirm function.[${JSON.stringify(error)}]`)
    rej(e)
  }),

  notify: (opts:NotificationOptions) => {

  },
})
