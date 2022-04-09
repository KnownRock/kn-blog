import React, { MouseEventHandler } from 'react'

export type Options = {
  title?: string
  content?: string
  component?: React.ReactNode,
  noClose?: boolean,
  noBlur?: boolean,
  isOk?:()=>Promise<boolean>,
}

export type NotificationOptions = {
  message?: string,
  timeout?: number,
} | string

export type MenuItemInfo = {
  label: string,
  onClick:MouseEventHandler,
  type?: 'primary' | 'secondary' | 'default' | 'inherit' | 'error' | 'disabled',
} | {
  type:'divider',
}

export interface InfoContextProps {
  info:(opts:Options) => Promise<string>,
  error:(error:Error) => Promise<string>,
  notify:(opts:NotificationOptions) => Promise<string>,
  menu:(opts:{
    anchor: HTMLElement,
    items:MenuItemInfo[]
    width?:number,
  }) => Promise<string>,
}

export default React.createContext<InfoContextProps>({
  info: (opts:Options) => new Promise((res, rej) => {
    const error = new Error(`You must implement confirm function.[${JSON.stringify(opts)}]`)
    rej(error)
  }),

  error: (error:Error) => new Promise((res, rej) => {
    const e = new Error(`You must implement confirm function.[${JSON.stringify(error)}]`)
    rej(e)
  }),

  notify: (opts:NotificationOptions) => new Promise((res, rej) => {
    const e = new Error(`You must implement confirm function.[${JSON.stringify(opts)}]`)
    rej(e)
  }),

  menu() {
    throw new Error('You must implement menu function.')
  },
})
