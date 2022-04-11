import {
  createContext, Dispatch,
  SetStateAction, useContext, useEffect, useMemo, useRef, useState,
} from 'react'
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye'
import {
  AtomicBlockUtils,
  ContentBlock,
  ContentState,
  convertFromRaw,
  convertToRaw,
  DraftEditorCommand, DraftHandleValue,
  Editor, EditorState, Modifier, RawDraftContentState, RichUtils, SelectionState,
} from 'draft-js'
import {
  Box, Card, IconButton, Input,
} from '@mui/material'
import { useDropzone } from 'react-dropzone'
import FormatBold from '@mui/icons-material/FormatBold'
import FormatItalic from '@mui/icons-material/FormatItalic'
import FormatUnderlined from '@mui/icons-material/FormatUnderlined'

import Code from '@mui/icons-material/Code'
import Image from '@mui/icons-material/Image'

import './index.css'
import { useTranslation } from 'react-i18next'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import mime from 'mime'
import MonacoEditor from '@monaco-editor/react'
import { useSelectFile, useSelectImg, useSettingFileTypeAndName } from '../../hooks/use-selector'
import { convertBlobsToDataUrlWithFileName, convertFilesToDataUrlWithFileName } from '../../utils/file-tools'
import MediaComponent from './MediaComponent'
import EditorContext from '../../contexts/EditorContext'

function myBlockRenderer(contentBlock: ContentBlock) {
  const type = contentBlock.getType()
  if (type === 'atomic') {
    return {
      component: MediaComponent,
      editable: false,
      props: {
        foo: 'bar',
      },
    }
  }
  return undefined
}

function ArticleEditor({
  contentState,
  onContentStateChange = () => {},
  readOnly = false,
}:{
  contentState?: RawDraftContentState | undefined;
  onContentStateChange?: (contentState: RawDraftContentState) => void;
  readOnly?: boolean;
}) {
  const { getFileAsDataUrlWithFileName } = useSelectFile()
  const { t } = useTranslation()
  const [tempReadOnly, setTempReadOnly] = useState(false)
  const [state, setState] = useState({
    editorState:
    EditorState.createEmpty(),
  })
  const editorContainer = useRef<HTMLDivElement>(null)
  // const selectionChangeTimer = useRef<NodeJS.Timeout>(null)
  const [
    selectionChangeTimer,
    setSelectionChangeTimer] = useState<NodeJS.Timeout>(
    setTimeout(() => {}),
  )
  const [count, setCount] = useState(0)

  const [floatPosition, setFloatPosition] = useState({
    top: 0,
    left: 0,
  })

  // https://github.com/facebook/draft-js/issues/121
  function onTab(e : any) {
    e.preventDefault()

    const currentState = state.editorState
    const newContentState = Modifier.replaceText(
      currentState.getCurrentContent(),
      currentState.getSelection(),
      '  ',
    )

    setState({
      editorState: EditorState.push(currentState, newContentState, 'insert-characters'),
    })
  }

  const [floatVisible, setFloatVisible] = useState(false)

  useEffect(() => {
    let newState = EditorState.createEmpty()
    if (contentState) {
      newState = EditorState.createWithContent(
        new ContentState(convertFromRaw(contentState)),
      )
    }

    setState({
      editorState: newState,
    })
  }, [contentState])

  const onSelectionChanged = (editorState: EditorState) => {
    editorState.getSelection()

    const anchorNode = document.getSelection()?.anchorNode
    if (anchorNode && editorContainer.current?.contains(anchorNode)) {
      const rect:{
        top: number,
        left: number,
        width: number,
        height: number,
      } = document?.getSelection()?.getRangeAt(0)?.getBoundingClientRect() ?? {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      }
      if (rect.width < 0.1) {
        setFloatVisible(false)
      } else {
        setFloatVisible(true)
      }

      setFloatPosition(rect)
    }
  }

  const debouncedOnSelectionChanged = (editorState: EditorState) => {
    if (selectionChangeTimer) {
      clearTimeout(selectionChangeTimer)
    }
    setCount(count + 1)
    if (count > 5) {
      setCount(0)
      onSelectionChanged(editorState)
    }

    setSelectionChangeTimer(setTimeout(() => {
      onSelectionChanged(editorState)
      setCount(0)
    }, 10))
  }

  const onChange = (editorState: EditorState) => {
    setState({ editorState })
    debouncedOnSelectionChanged(editorState)
    onContentStateChange(convertToRaw(editorState.getCurrentContent()))
    // localStorage.setItem(
    //   'editorState',
    //   JSON.stringify(convertToRaw(editorState.getCurrentContent())))
  }
  const handleKeyCommand = (command: DraftEditorCommand) => {
    const newState = RichUtils.handleKeyCommand(state.editorState, command)
    if (newState) {
      onChange(newState)
      return 'handled'
    }
    return 'not-handled'
  }

  const addCodeBlock = (
    { blockType, code }: { blockType: 'code'; code: string },
  ) => {
    if (blockType === 'code') {
      const entityKey = state.editorState // from STATE
        .getCurrentContent()
        .createEntity('atomic', 'MUTABLE', {
          type: 'code',
          code,
        }).getLastCreatedEntityKey()

      // NEW EDITOR STATE
      setState((oldState) => ({
        editorState: AtomicBlockUtils.insertAtomicBlock(
          oldState.editorState,
          entityKey,
          ' ',
        ),
      }))
    }
  }

  const addCustomizedBlock = (
    { blockType, dataUrl, fileName }:DataUrlWithFileName & { blockType:'image' | 'file' },
  ) => {
    if (blockType === 'image') {
      const entityKey = state.editorState // from STATE
        .getCurrentContent()
        .createEntity('atomic', 'MUTABLE', {
          src: dataUrl,
          maxHeight: '600px',
          maxWidth: '600px',
          type: 'image',
          alt: fileName,
          fileName,
        }).getLastCreatedEntityKey()

      // NEW EDITOR STATE
      setState((oldState) => ({
        editorState: AtomicBlockUtils.insertAtomicBlock(
          oldState.editorState,
          entityKey,
          ' ',
        ),
      }))

      // onChange(newEditorState)
    }
    if (blockType === 'file') {
      const entityKey = state.editorState
        .getCurrentContent()
        .createEntity('atomic', 'MUTABLE', {
          src: dataUrl,
          maxHeight: '600px',
          maxWidth: '600px',
          type: 'file',
          fileName,
        }).getLastCreatedEntityKey()

      setState((oldState) => ({
        editorState: AtomicBlockUtils.insertAtomicBlock(
          oldState.editorState,
          entityKey,
          ' ',
        ),
      }))
    }
  }

  const handlePastedFiles = (blobs:Array<Blob>) => {
    convertBlobsToDataUrlWithFileName(blobs)
      .then((files) => files.forEach(
        ({ dataUrl, fileName }) => {
          const contentType = mime.getType(fileName)
          const blockType = contentType?.startsWith('image/') ? 'image' : 'file'
          addCustomizedBlock({
            blockType,
            dataUrl,
            fileName,
          })
        },
      ))

    return 'handled' as DraftHandleValue
  }
  const onDrop = (acceptedFiles:File[]) => {
    if (readOnly) return

    convertFilesToDataUrlWithFileName(acceptedFiles)
      .then((files) => files.forEach(
        ({ dataUrl, fileName }) => {
          const contentType = mime.getType(fileName)
          const blockType = contentType?.startsWith('image/') ? 'image' : 'file'
          addCustomizedBlock({
            blockType,
            dataUrl,
            fileName,
          })
        },
      ))
  }

  // const onDrop = async (acceptedFiles:File[]) => {
  //   convertFilesToDataUrlWithFileName(acceptedFiles)
  //     .then((files) => {
  //       for (let i = 0; i < files.length; i += 1) {
  //         const file = files[i]
  //         const { dataUrl, fileName } = file
  //         const contentType = mime.getType(fileName)
  //         const blockType = contentType?.startsWith('image/') ? 'image' : 'file'
  //         addCustomizedBlock({
  //           blockType,
  //           dataUrl,
  //           fileName,
  //         })
  //       }
  //     })
  // }

  const onBoldClick = () => {
    onChange(RichUtils.toggleInlineStyle(state.editorState, 'BOLD'))
    // onChange(RichUtils.toggleBlockType(state.editorState, 'header-one'))
  }
  const onItalicClick = () => {
    onChange(RichUtils.toggleInlineStyle(state.editorState, 'ITALIC'))
  }
  const onUnderlineClick = () => {
    onChange(RichUtils.toggleInlineStyle(state.editorState, 'UNDERLINE'))
  }

  const onCodeClick = () => {
    // onChange(RichUtils.toggleBlockType(state.editorState, 'code-block'))
    // getFileAsDataUrlWithFileName().then(({ dataUrl, fileName }) => {
    // if (!dataUrl) return
    addCodeBlock({ blockType: 'code', code: '123' })
    // })
  }

  const onBlur = () => {
    setFloatVisible(false)
  }

  const onImgClick = async () => {
    // const selectionText = document?.getSelection?.()?.toString() ?? 'image'

    getFileAsDataUrlWithFileName().then(({ dataUrl, fileName }) => {
      if (!dataUrl) return
      addCustomizedBlock({ blockType: 'image', dataUrl, fileName })
    })
  }

  const onFileClick = async () => {
    getFileAsDataUrlWithFileName().then(({ dataUrl, fileName }) => {
      if (!dataUrl) return
      addCustomizedBlock({ blockType: 'file', dataUrl, fileName })
    })
  }

  const myBlockStyleFn = (contentBlock: ContentBlock):string => {
    const type = contentBlock.getType()
    if (type === 'blockquote') {
      return 'knBlogBlockquote'
    }
    if (type === 'unstyled') {
      return 'knBlogUnstyled'
    }
    if (type === 'code-block') {
      return 'knBlogCodeBlock'
    }
    return type
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  })

  const editorContext = useMemo(() => ({
    state,
    setState,
    readOnly,
    setTempReadOnly,
  }), [state, readOnly])

  const dropProps = useMemo(() => getRootProps(), [getRootProps])

  return (
    <Box sx={{
    }}
    >
      <Card
        sx={{

          transition: 'all 0.2s ease-in-out',
          position: 'fixed',
          zIndex: floatVisible ? 10 : -1,
          top: `${floatPosition.top - 40}px`,
          left: `${floatPosition.left}px`,
          opacity: floatVisible ? 1 : 0,
          height: '40px',
        }}

      >
        {/* https://github.com/facebook/draft-js/issues/275 */}
        <IconButton onClick={onBoldClick} onMouseDown={(e) => e.preventDefault()}>
          <FormatBold />
        </IconButton>
        <IconButton onClick={onItalicClick} onMouseDown={(e) => e.preventDefault()}>
          <FormatItalic />
        </IconButton>
        <IconButton onClick={onUnderlineClick} onMouseDown={(e) => e.preventDefault()}>
          <FormatUnderlined />
        </IconButton>
        <IconButton onClick={onCodeClick} onMouseDown={(e) => e.preventDefault()}>
          <Code />
        </IconButton>

        <IconButton onClick={onImgClick} onMouseDown={(e) => e.preventDefault()}>
          <Image />
        </IconButton>
        <IconButton onClick={onFileClick} onMouseDown={(e) => e.preventDefault()}>
          <AttachFileIcon />
        </IconButton>
      </Card>
      <Box
        ref={editorContainer}
        sx={{
          paddingTop: 1,
          ...readOnly ? {} : { backgroundColor: 'rgba(255,255,0,0.1)' },
        }}
        onDrop={dropProps.onDrop}
      >

        { !readOnly
          && (
          <input
          // eslint-disable-next-line react/jsx-props-no-spreading
            {...getInputProps()}
          />
          )}
        <EditorContext.Provider value={editorContext}>
          <Editor
            blockRendererFn={myBlockRenderer}
            readOnly={readOnly || tempReadOnly}
            onBlur={onBlur}
            placeholder={t('Write something...')}
            editorState={state.editorState}
            handleKeyCommand={handleKeyCommand}
            handlePastedFiles={handlePastedFiles}
          // handleDroppedFiles={handleDroppedFiles}
            onChange={onChange}
            blockStyleFn={myBlockStyleFn}
          />
        </EditorContext.Provider>
      </Box>
    </Box>
  )
}

ArticleEditor.defaultProps = {
  contentState: undefined,
  onContentStateChange: () => {},
}

export default ArticleEditor
