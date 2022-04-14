import {
  useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react'
import {
  ContentBlock,
  ContentState, EditorState,
} from 'draft-js'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import MonacoEditorCom from '@monaco-editor/react'
import { useTranslation } from 'react-i18next'
import SettingsIcon from '@mui/icons-material/Settings'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// import { docco, dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs'
// import dracula from 'react-syntax-highlighter/dist/esm/styles/prism/dracula'
import dracula from 'react-syntax-highlighter/dist/cjs/styles/prism/dracula'
import SaveIcon from '@mui/icons-material/Save'
import { useSettingCodeLanguage, useSettingFileTypeAndName } from '../../hooks/use-selector'
import EditorContext from '../../contexts/EditorContext'
import InfoContext from '../../contexts/InfoContext'

function BlockTool({
  readOnly, handleRemove, children,
  handleSetting, handleSave,
}:{
  readOnly: boolean,
  handleRemove: (e: any) => void,
  children: JSX.Element | JSX.Element[]
  handleSetting?: (e: any) => void,
  handleSave?: (e: any) => void,
}): JSX.Element | null {
  const { t } = useTranslation()
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
        }}
      >
        {!readOnly && (
        <Box sx={{
          // position: 'relative',
          width: '100%',
          // height: 0,
          zIndex: 1,
          display: 'flex',
          justifyContent: 'center',
        }}
        >
          {handleSetting && (
          <Tooltip title={t('Setting') as string} placement="top">
            <IconButton color="info" onClick={handleSetting}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          )}
          <Tooltip title={t('Remove') as string} placement="top">
            <IconButton color="warning" onClick={handleRemove}>
              <RemoveCircleOutlineIcon />
            </IconButton>
          </Tooltip>
          {handleSave && (
          <Tooltip title={t('Save') as string} placement="top">
            <IconButton color="default" onClick={handleSave}>
              <SaveIcon />
            </IconButton>
          </Tooltip>
          )}

        </Box>
        )}
        {children}
      </Box>
    </Box>
  )
}

const mdRenderer = {
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

function Code({
  handleCodeSetting,
  handleCodeChanged,
  setTempReadOnly,
  readOnly,
  handleRemove,
  data,
}:{
  handleCodeSetting: (e: any) => void,
  handleCodeChanged: (code: string) => void,
  setTempReadOnly: (readOnly: boolean) => void,
  handleRemove: (e: any) => void,
  readOnly: boolean,
  data: any
}) {
  const [editor, setEditor] = useState<any>(null)
  const container = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(300)
  const { t } = useTranslation()
  const { editor: draftEditor } = useContext(EditorContext)
  const { notify } = useContext(InfoContext)
  const handleSave = (e: any) => {
    const code = editor.getValue()
    setTempReadOnly(false)
    setTimeout(() => {
      handleCodeChanged(code)
      notify(t('Code saved') as string)
    }, 0)
  }
  useEffect(() => {
    if (editor && container.current) {
      const updateHeight = () => {
        // setHeight((editor.getModel().getLineCount() + 1) * 22)
      }
      editor.onDidContentSizeChange(updateHeight)
    }
  }, [editor])

  if (readOnly) {
    if (data.type === 'code') {
      return (
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
      )
    }

    if (data.type === 'md-block') {
      return (
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
      )
    }
  }

  return (
    <BlockTool handleSave={handleSave} handleSetting={data.type === 'code' ? handleCodeSetting : undefined} readOnly={readOnly} handleRemove={handleRemove}>
      <Typography
        sx={{
          userSelect: 'none',
        }}
        variant="caption"
        color="textSecondary"
      />
      <Box
        onKeyDown={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onFocus={() => {
          setTempReadOnly(true)
        }}
        onBlur={() => {
          // FIXME: direct save causes problems that causes the editor to lose changes
          setTempReadOnly(false)
          // setTimeout(() => {
          //   if (draftEditor.current) {
          //     draftEditor.current.focus()
          //   }
          // }, 0)
        }}
        width="100%"
        ref={container}
      >
        <MonacoEditorCom
          onMount={(parEditor) => {
            setEditor(parEditor)
          }}
          options={{
            readOnly,
            fontSize: 16,
            lineNumbers: 'off',
            folding: false,
          }}
          defaultValue={data.code}
          onChange={(v) => {
            handleCodeChanged(v ?? '')
          }}
        // theme="vs-dark"
          language={data.language ?? 'text'}
          height={height}
        />
      </Box>
      <Typography
        sx={{
          userSelect: 'none',
        }}
        variant="caption"
        color="textSecondary"
      >
        {data.type === 'code' ? `${t('Code')}[${data.language}]` : t('Markdown Block')}
      </Typography>
    </BlockTool>

  )
}

function Image({
  handleImgClick, readOnly, handleRemove, data,
  handleFileSetting,
}:
{ handleImgClick: () => Promise<void>, readOnly: boolean,
  handleFileSetting: (e: any) => void,
  handleRemove: (e: any) => void, data: any }): JSX.Element | null {
  return (
    <BlockTool handleSetting={handleFileSetting} readOnly={readOnly} handleRemove={handleRemove}>

      <img
        style={{
          maxHeight: data.maxHeight,
          maxWidth: data.maxWidth,
          display: 'block',
          ...(!readOnly ? { cursor: 'pointer' } : {}),
        }}
        src={data.src}
        alt={data.alt}
        height={data.height}
        width={data.width}
      />

      <Typography
        sx={{
          userSelect: 'none',
        }}
        variant="caption"
        color="textSecondary"
      >
        {data.displayName || data.alt}
      </Typography>
    </BlockTool>
  )
}

function File({
  readOnly, handleRemove, handleFileClick, data,
  handleFileSetting,
}:{
  readOnly: boolean,
  handleRemove: (e: any) => void,
  handleFileSetting: (e: any) => void,
  handleFileClick: () => Promise<void>, data: any
}): JSX.Element | null {
  return (
    <BlockTool handleSetting={handleFileSetting} readOnly={readOnly} handleRemove={handleRemove}>
      <Button variant="outlined" onClick={handleFileClick} startIcon={<AttachFileIcon />}>
        {data.displayName || data.fileName}
      </Button>
    </BlockTool>
  )
}

export default function MediaComponent(props: {
  block: ContentBlock;
  contentState: ContentState;
  blockProps: any;
}) {
  const {
    block, contentState, blockProps,
  } = props

  const {
    state, setState, readOnly, setTempReadOnly,
  } = useContext(EditorContext)
  const { settingFileTypeAndName } = useSettingFileTypeAndName()

  // const { foo } = blockProps
  const data = contentState.getEntity(block.getEntityAt(0)).getData()
  const mediaType = data.type

  const handleCodeChanged = useCallback((newValue: string) => {
    state.editorState
      .getCurrentContent()
      .mergeEntityData(block.getEntityAt(0), {
        code: newValue,
      })

    setState({
      editorState: state.editorState,
    })
  }, [block, setState, state.editorState])

  const handleFileSetting = useCallback(async () => {
    const { fileName, fileType, displayName } = await settingFileTypeAndName({
      fileName: data.fileName,
      fileType: data.type as ('image' | 'file'),
      displayName: data.displayName,
    })

    state.editorState
      .getCurrentContent()
      .mergeEntityData(block.getEntityAt(0), {
        type: fileType,
        alt: fileName,
        fileName,
        displayName,
      })

    setState({
      editorState: state.editorState,
    })
  }, [
    block, data.displayName, data.fileName,
    data.type, setState, settingFileTypeAndName,
    state.editorState,
  ])

  const { settingCodeLanguage } = useSettingCodeLanguage()

  const handleCodeSetting = useCallback(async () => {
    const { language } = await settingCodeLanguage({
      language: data.language,
    })
    state.editorState
      .getCurrentContent()
      .mergeEntityData(block.getEntityAt(0), {
        language,
      })

    setState({
      editorState: state.editorState,
    })
  }, [block, data.language, setState, settingCodeLanguage, state.editorState])

  const handleFileClick = useCallback(async () => {
    const a = document.createElement('a')
    a.href = data.src
    a.download = data.fileName
    a.target = '_blank'
    a.click()
  }, [data.fileName, data.src])

  const handleImgClick = useCallback(async () => {
    if (readOnly) { return }

    // const contentState = Modifier.insertText(
    //   editorState.getCurrentContent(),
    //   editorState.getSelection(),
    //   insertionText,
    //   editorState.getCurrentInlineStyle(),
    // );
    const { fileName, fileType, displayName } = await settingFileTypeAndName({
      fileName: data.fileName,
      fileType: data.type as ('image' | 'file'),
      displayName: data.displayName,
    })

    state.editorState
      .getCurrentContent()
      .mergeEntityData(block.getEntityAt(0), {
        type: fileType,
        alt: displayName,
        fileName,
        displayName,
      })

    setState({
      editorState: state.editorState,
    })
  }, [block, data.displayName, data.fileName,
    data.type, readOnly, setState, settingFileTypeAndName, state.editorState])
  const { editor: draftEditor } = useContext(EditorContext)
  const handleRemove = useCallback((e) => {
    e.stopPropagation()

    const currentContentState = state.editorState.getCurrentContent()
    const changedContentState = ContentState.createFromBlockArray(
      currentContentState
        .getBlockMap()
        .toArray()
        .filter((b) => b.getKey() !== block.getKey()),
    )
    const editorState = EditorState.push(state.editorState, changedContentState, 'change-block-data')
    setState({
      editorState,
    })
    setTimeout(() => {
      if (draftEditor.current) {
        draftEditor.current.focus()
      }
    }, 0)
  }, [block, draftEditor, setState, state.editorState])

  const imageNode = useMemo(() => {
    if (mediaType === 'image') {
      return (
        <Image
          handleFileSetting={handleFileSetting}
          handleImgClick={handleImgClick}
          readOnly={readOnly}
          handleRemove={handleRemove}
          data={data}
        />
      )
    }
    return null
  }, [data, handleFileSetting, handleImgClick, handleRemove, mediaType, readOnly])

  const mediaNode = useMemo(
    () => {
      if (mediaType === 'file') {
      // File(mediaType, readOnly, handleRemove, handleFileClick, data)
        return (
          <File
            handleFileSetting={handleFileSetting}
            readOnly={readOnly}
            handleRemove={handleRemove}
            handleFileClick={handleFileClick}
            data={data}
          />
        )
      }
      return null
    },
    [mediaType, handleFileSetting, readOnly, handleRemove, handleFileClick, data],
  )

  const codeNode = useMemo(() => {
    // https://stackoverflow.com/questions/58898700/how-to-enter-text-in-a-text-input-inside-an-atomic-block
    if (mediaType === 'code' || mediaType === 'md-block') {
      return (
        <Code
          handleCodeSetting={handleCodeSetting}
          handleCodeChanged={handleCodeChanged}
          data={data}
          handleRemove={handleRemove}
          setTempReadOnly={setTempReadOnly}
          readOnly={readOnly}
        />
      )
    }
    return null
  }, [data, handleCodeChanged,
    handleCodeSetting, handleRemove, mediaType, readOnly, setTempReadOnly])

  // debugger
  return (
    <Box style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    }}
    >
      {imageNode}
      {mediaNode}
      {codeNode}
    </Box>
  )
}
