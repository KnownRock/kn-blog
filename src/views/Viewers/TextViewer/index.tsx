import { useContext, useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'
import {
  Box, CircularProgress, Fab, Modal,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { useTranslation } from 'react-i18next'
import { useFileText, useGetFile } from '../../../hooks/fs-hooks'
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

function Viewer({ path, readOnly }: { path: string, readOnly: boolean }) {
  const { error: infoError, notify } = useContext(InfoContext)

  const { text, loading, error } = useFileText(path || '')
  const [editorText, setEditorText] = useState(text)

  const { t } = useTranslation()

  let language = extLanguageDict[path?.match(/\.([^.]*)$/)?.[1] ?? ''] ?? 'text'
  if (path === '.env') {
    language = 'json'
  }

  const handleSave = () => {
    saveTextFile(path, editorText).then(() => notify({
      message: t('File saved'),
    })).catch((e) => {
      infoError(e)
    })
  }

  useEffect(() => {
    if (!loading) {
      setEditorText(text)
    }
  }, [loading, text])

  return (
    <>

      <Editor
        options={{
          fontSize: 16,
          readOnly,
        }}
        height="100%"
        value={editorText}
        defaultLanguage={language}
        onChange={(newValue) => {
          setEditorText(newValue ?? '')
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
