import React from 'react'

type FilesContext = {
  refetch:() => void,
  onOpen:(par:FileInfo) => void,

  Detail?:({ object }:{ object:FileInfo }) => JSX.Element,
}

export default React.createContext<FilesContext>({
  refetch: () => {},
  onOpen: () => {},
})
