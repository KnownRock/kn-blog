import {
  useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import MonacoEditorCom from '@monaco-editor/react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import dracula from 'react-syntax-highlighter/dist/cjs/styles/prism/dracula'
import EditorContext from '../../contexts/EditorContext'
import InfoContext from '../../contexts/InfoContext'
import BlockTool from './BlockTool'
import { useSettingCodeLanguage } from '../../hooks/use-selector'

export const mdRenderer = {
  code: (props: any) => {
    const { language } = props
    // debugger
    return (

      <SyntaxHighlighter
        language="js"
        style={dracula}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />

    )
  },

}
export default function Code({
  data, block,
}: {
  data: any;
  block: any
}) {
  const { settingCodeLanguage } = useSettingCodeLanguage()
  const {
    stateRef, setState,
  } = useContext(EditorContext)

  const setStateRef = useRef(setState)
  useEffect(() => {
    setStateRef.current = setState
  }, [setState])

  const handleCodeChanged = useCallback((newValue: string) => {
    stateRef.current.editorState
      .getCurrentContent()
      .mergeEntityData(block.getEntityAt(0), {
        code: newValue,
      })

    setState({
      editorState: stateRef.current.editorState,
    })
  }, [block, setState, stateRef])

  const handleCodeSetting = useCallback(async () => {
    const { language, code } = await settingCodeLanguage({
      language: data.language,
      code: data.code,
      type: data.type,
    })
    stateRef.current.editorState
      .getCurrentContent()
      .mergeEntityData(block.getEntityAt(0), {
        language,
        code,
      })

    setState({
      editorState: stateRef.current.editorState,
    })

    handleCodeChanged(code)
  }, [
    block, data.code,
    data.language, data.type,
    handleCodeChanged, setState,
    settingCodeLanguage, stateRef,
  ])

  if (data.type === 'code') {
    return (
      <BlockTool block handleSetting={data.type === 'code' ? handleCodeSetting : undefined}>
        <Box
          sx={{
            alignItems: 'left',
            justifyContent: 'left',
            width: '100%',
          }}
        >

          <ReactMarkdown
            components={mdRenderer}
          >
            {`\`\`\`${data.language}\n${data.code}\n\`\`\``}
          </ReactMarkdown>

        </Box>
      </BlockTool>
    )
  }

  if (data.type === 'md-block') {
    return (
      <BlockTool block handleSetting={handleCodeSetting}>
        <Box
          sx={{
            alignItems: 'left',
            justifyContent: 'left',
            width: '100%',
          }}
        >

          <ReactMarkdown components={mdRenderer}>
            {data.code}
          </ReactMarkdown>

        </Box>
      </BlockTool>
    )
  }

  return (
    null
  )
}
