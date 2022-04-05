import { useMemo, useState } from 'react'

import InfoDialog from './InfoDialog'

import InfoContext from '../../contexts/InfoContext'

type Options = {
  title?: string
  content?: string,
  component?: React.ReactNode,
}
export default function Info({
  children,
}:{
  children: React.ReactNode,
}) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<{
    title?: string,
    content?: string,

    component?: React.ReactNode,
  }>({})
  const [proms, setProms] = useState<{
    resolve:(value:unknown) => void,
    reject:(value:unknown) => void,
  }>({
        resolve: () => {},
        reject: () => {},
      })

  const info = (opts:Options) => new Promise((resolve, reject) => {
    setOptions(opts)
    setOpen(true)
    setProms({
      resolve,
      reject,
    })
  })

  const infoContext = useMemo(() => ({
    info,
  }), [])

  return (
    <>
      <InfoDialog open={open} setOpen={setOpen} options={options} proms={proms} />
      <InfoContext.Provider value={infoContext}>
        {children}
      </InfoContext.Provider>
    </>
  )
}
