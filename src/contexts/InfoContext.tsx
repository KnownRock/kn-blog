import React from 'react'

type Options = {
  title: string
  content: string
}

export default React.createContext({
  info: (opts:Options) => new Promise((res, rej) => {
    const error = new Error(`You must implement confirm function.[${JSON.stringify(opts)}]`)
    rej(error)
  }),
})
