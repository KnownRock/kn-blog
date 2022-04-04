import { useEffect, useState } from 'react'
import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react'
import { Fab } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { useGetFile } from '../../../hooks/fs-hooks'
import Basic from '../Basic'
import { saveTextFile } from '../../../utils/fs'

const extLanguageDict: { [key: string]: string } = {
  js: 'javascript',
  ts: 'typeScript',
  md: 'markdown',
  json: 'json',
  html: 'html',
  css: 'css',
  scss: 'scss',
  sass: 'sass',
  less: 'less',
  tsx: 'typescript',
  tsconfig: 'json',
  jsx: 'javascript',
}

function Viewer({ path }: { path: string }) {
  const [text, setText] = useState('')

  const { object, loading, error } = useGetFile(path || '')

  useEffect(() => {
    if (object) {
      const reader = new FileReader()
      reader.onload = () => {
        setText(reader.result as string)
      }
      reader.readAsText(object)
    }
  }, [object])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error...</div>

  const language = extLanguageDict[path?.match(/\.([^.]*)$/)?.[1] ?? ''] ?? 'text'

  const handleSave = () => {
    saveTextFile(path, text)
  }

  return (
    <>
      <Editor
        options={{
          fontSize: '16px',
        }}
        height="100%"
        defaultValue={text}
        defaultLanguage={language}
        onChange={(newValue, e) => {
          setText(newValue ?? '')
        }}
      />
      <Fab
        color="primary"
        aria-label="save"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        size="large"
        onClick={handleSave}
      >
        <SaveIcon />
      </Fab>
    </>

  )
}

export default function TextViewerPage() {
  return (
    <Basic
      FileViewer={Viewer}
    />
  )
}
