import {
  useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react'
import {
  ContentBlock,
  ContentState, EditorState,
} from 'draft-js'
import {
  Box, Button, IconButton, Input,
} from '@mui/material'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import MonacoEditorCom from '@monaco-editor/react'
import { useSettingFileTypeAndName } from '../../hooks/use-selector'
import EditorContext from '../../contexts/EditorContext'

function Code({
  setTempReadOnly,
  readOnly,
}:{
  setTempReadOnly: (readOnly: boolean) => void,
  readOnly: boolean,
}) {
  const [editor, setEditor] = useState<any>(null)
  const container = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(22)
  useEffect(() => {
    if (editor && container.current) {
      const updateHeight = () => {
        setHeight((editor.getModel().getLineCount() + 1) * 22)
      }
      editor.onDidContentSizeChange(updateHeight)
    }
  }, [editor])

  return (
    <Box
      onKeyDown={(e) => e.stopPropagation()}
      onKeyUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onFocus={() => { setTempReadOnly(true) }}
      onBlur={() => setTempReadOnly(false)}
      width="90%"
      ref={container}
    >
      <MonacoEditorCom
        onMount={(parEditor) => {
          setEditor(parEditor)
        }}
        options={{
          readOnly,
          fontSize: 16,
        }}
        theme="vs-dark"
        language="javascript"
        height={height}
      />
    </Box>

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

  const handleFileClick = useCallback(async () => {
    if (readOnly) {
      const a = document.createElement('a')
      a.href = data.src
      a.download = data.fileName
      a.target = '_blank'
      a.click()
    } else {
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
    }
  }, [block, data.displayName, data.fileName,
    data.src, data.type, readOnly,
    setState, settingFileTypeAndName, state.editorState])

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
  }, [block, setState, state.editorState])

  const mediaNode = useMemo(() => {
    if (mediaType === 'image') {
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
            onClick={handleImgClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              flexDirection: 'column',
            }}
          >
            <Box sx={{
              position: 'relative',
              width: '100%',
              height: 0,
            }}
            >
              {!readOnly && (
                <IconButton color="warning" onClick={handleRemove}>
                  <RemoveCircleOutlineIcon />
                </IconButton>
              )}
            </Box>

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
            <span>{data.displayName || data.alt}</span>
          </Box>
        </Box>
      )
    }
    if (mediaType === 'file') {
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
                position: 'relative',
                width: '100%',
                height: 0,
              }}
              >
                <IconButton color="warning" onClick={handleRemove}>
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </Box>
            )}
            <Button variant="outlined" onClick={handleFileClick} startIcon={<AttachFileIcon />}>
              {data.displayName || data.fileName}
            </Button>

          </Box>
        </Box>
      )
    }

    return (
      null
    )
  }, [mediaType, handleImgClick, readOnly,
    handleRemove, data.maxHeight,
    data.maxWidth, data.src, data.alt,
    data.height, data.width, data.displayName, data.fileName, handleFileClick])

  const codeNode = useMemo(() => {
    // https://stackoverflow.com/questions/58898700/how-to-enter-text-in-a-text-input-inside-an-atomic-block
    if (mediaType === 'code') {
      return <Code setTempReadOnly={setTempReadOnly} readOnly={readOnly} />
    }
    return null
  }, [mediaType, readOnly, setTempReadOnly])

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
      {mediaNode}
      {codeNode}
    </Box>
  )
}
