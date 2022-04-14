import Box from '@mui/material/Box'
import Input from '@mui/material/Input'
import { useState } from 'react'
import Files from './Files'

export default function FolderSelector({ onSelect, nowPath, type }: {
  onSelect: (path: string) => void;
  nowPath: string;
  type: 'folder' | 'file';
}) {
  const [path, setPath] = useState(nowPath.replace(/((?<=\/)|(?<=^))[^/]*$/, ''))
  const [filePath, setFilePath] = useState(nowPath)
  const oldFileName = type === 'file'
    ? nowPath.match(/((?<=\/)|(?<=^))[^/]*$/)?.[0] ?? ''
    : ''

  const [fileName, setFileName] = useState(oldFileName)

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const fPath = e.target.value

    setPath(fPath.replace(/((?<=\/)|(?<=^))[^/]*$/, ''))
    setFilePath(fPath)
    if (type === 'file') {
      setFileName(fPath.match(/((?<=\/)|(?<=^))[^/]*$/)?.[0] ?? '')
    }

    onSelect(fPath)
  }

  function handleNavigate(p: string) {
    const px = p === '' ? '' : `${p}/`
    setPath(px)
    setFilePath(`${px}${fileName}`)
  }

  function handleOnOpen(object: { name: string, type: string }) {
    if (type === 'file' && object.type === 'file') {
      setPath(object.name.replace(/((?<=\/)|(?<=^))[^/]*$/, ''))
      setFilePath(object.name)

      onSelect(object.name)
    } else {
      setPath(`${object.name}/`)
      setFilePath(`${object.name}/${fileName}`)

      onSelect(`${object.name}/${fileName}`)
    }
  }

  return (
    <Box>
      <Box sx={{
        height: '50vh',
      }}
      >
        <Files
          onNavigate={handleNavigate}
          path={path}
          type={type === 'file' ? 'selectFile' : 'selectFolder'}
          onOpen={handleOnOpen}
        />

      </Box>
      <Box>
        <Input
          fullWidth
          value={filePath}
          onChange={handleInput}
        />
      </Box>
    </Box>
  )
}
