import React from 'react'

export type FilesContext = {
  refetch:() => void,
  onOpen:(par:FileInfo) => void,
  onNavigate:(path:string) => void,
  type:string
  Detail?:({ object }:{ object:FileInfo }) => JSX.Element,

}

export default React.createContext<FilesContext>({
  refetch: () => {},
  onOpen: () => {},
  onNavigate: () => {},
  type: 'browse',

})
