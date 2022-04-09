import { useContext, useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'
import { Fab } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { useTranslation } from 'react-i18next'
import { useGetFile } from '../../../hooks/fs-hooks'
import Basic from '../Basic'
import { saveTextFile } from '../../../utils/fs'
import InfoContext from '../../../contexts/InfoContext'

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
  s3: 'json',
}

function Viewer({ path }: { path: string }) {
  // debugger
  const [text, setText] = useState('')
  const { t } = useTranslation()

  const { object, loading, error } = useGetFile(path || '')
  const { error: infoError, notify } = useContext(InfoContext)
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
    saveTextFile(path, text).then(() => notify({
      message: t('File saved'),
    })).catch((e) => {
      infoError(e)
    })
  }

  return (
    <>
      <Editor
        options={{
          fontSize: 16,
        }}
        height="100%"
        value={text}
        defaultLanguage={language}
        onChange={(newValue) => {
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
