import {
  useCallback,
  useEffect, useMemo, useRef, useState,
} from 'react'
import {
  AtomicBlockUtils,
  ContentState,
  convertFromRaw,
  convertToRaw,
  DraftEditorCommand, DraftHandleValue,
  Editor, EditorState, RawDraftContentState, RichUtils,
} from 'draft-js'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import IconButton from '@mui/material/IconButton'

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
import ShortTextIcon from '@mui/icons-material/ShortText'
import FileOpenIcon from '@mui/icons-material/FileOpen'
import { useSelectFile, useSettingLinkUrl } from '../../hooks/use-selector'
import { convertBlobsToDataUrlWithFileName, convertFilesToDataUrlWithFileName } from '../../utils/file-tools'
import EditorContext from '../../contexts/EditorContext'
import decorator from './decorator'
import customBlockRenderer from './customBlockRenderer'
import MenuHeaderIcon from './MenuHeaderIcon'
import customBlockStyleFn from './customBlockStyleFn'

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
  const { settingLinkUrl } = useSettingLinkUrl()
  const { t } = useTranslation()
  const [tempReadOnly, setTempReadOnly] = useState(false)
  const editor = useRef<Editor>(null)

  const [state, setState] = useState({
    editorState:
    EditorState.createEmpty(decorator),
  })
  useEffect(() => {
    console.log('useEffect')
  }, [setState])

  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    console.log('33')
  }, [stateRef])

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
    width: 0,
    height: 0,
  })

  const [floatVisible, setFloatVisible] = useState(false)

  const onWheel = useCallback(
    () => {
      setFloatVisible(false)
    },
    [],
  )
  useEffect(() => {
    window.addEventListener('wheel', onWheel)
    return () => {
      window.removeEventListener('wheel', onWheel)
    }
  }, [onWheel])

  useEffect(() => {
    let newState = EditorState.createEmpty()
    if (contentState) {
      newState = EditorState.createWithContent(
        new ContentState(convertFromRaw(contentState)),
        decorator,
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
    { blockType, code, language = 'text' }: { blockType: 'code' | 'md-block'; code: string; language?: string },
  ) => {
    if (blockType === 'code' || blockType === 'md-block') {
      const entityKey = state.editorState // from STATE
        .getCurrentContent()
        .createEntity('atomic', 'MUTABLE', {
          type: blockType,
          code,
          language,
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
          maxHeight: '80%',
          maxWidth: '80%',
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

  const onHeaderOneClick = () => {
    onChange(RichUtils.toggleBlockType(state.editorState, 'header-one'))
  }
  const onHeaderTwoClick = () => {
    onChange(RichUtils.toggleBlockType(state.editorState, 'header-two'))
  }
  const onHeaderThreeClick = () => {
    onChange(RichUtils.toggleBlockType(state.editorState, 'header-three'))
  }
  const onHeaderFourClick = () => {
    onChange(RichUtils.toggleBlockType(state.editorState, 'header-four'))
  }
  const onHeaderFiveClick = () => {
    onChange(RichUtils.toggleBlockType(state.editorState, 'header-five'))
  }
  const onHeaderSixClick = () => {
    onChange(RichUtils.toggleBlockType(state.editorState, 'header-six'))
  }

  const onBlockquoteClick = () => {
    onChange(RichUtils.toggleBlockType(state.editorState, 'blockquote'))
  }

  const onLinkClick = async () => {
    const { url } = await settingLinkUrl({ url: '' })

    // // https://codesandbox.io/s/nz8fj?file=/src/index.js:2695-2717
    const contentStateWithEntity = state.editorState // from STATE
      .getCurrentContent()
      .createEntity(
        'LINK',
        'MUTABLE',
        { url },
      )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()

    const nextEditorState = EditorState.set(
      state.editorState,
      { currentContent: contentStateWithEntity },
    )

    onChange(
      RichUtils.toggleLink(state.editorState, nextEditorState.getSelection(), entityKey),
    )
  }

  const onCodeClick = () => {
    // onChange(RichUtils.toggleBlockType(state.editorState, 'code-block'))
    // getFileAsDataUrlWithFileName().then(({ dataUrl, fileName }) => {
    // if (!dataUrl) return
    // TODO: use api to get text
    const selectionText = document?.getSelection?.()?.toString() ?? 'image'
    addCodeBlock({ blockType: 'code', code: selectionText })
    // })
  }

  const onMdBlockClick = () => {
    const selectionText = document?.getSelection?.()?.toString() ?? 'image'
    addCodeBlock({
      blockType: 'md-block',
      code: selectionText,
      language: 'markdown',
    })
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

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
  })

  const editorContext = useMemo(() => ({
    setState,
    readOnly,
    setTempReadOnly,
    editor,
    stateRef,
  }), [stateRef, readOnly, editor])

  const dropProps = useMemo(() => getRootProps(), [getRootProps])

  const menuItems = [[{
    id: 'h1',
    icon: <MenuHeaderIcon str="H1" />,
    onClick: onHeaderOneClick,
  }, {
    id: 'h2',
    icon: <MenuHeaderIcon str="H2" />,
    onClick: onHeaderTwoClick,
  }, {
    id: 'h3',
    icon: <MenuHeaderIcon str="H3" />,
    onClick: onHeaderThreeClick,
  }, {
    id: 'h4',
    icon: <MenuHeaderIcon str="H4" />,
    onClick: onHeaderFourClick,
  }, {
    id: 'h5',
    icon: <MenuHeaderIcon str="H5" />,
    onClick: onHeaderFiveClick,
  }, {
    id: 'h6',
    icon: <MenuHeaderIcon str="H6" />,
    onClick: onHeaderSixClick,
  },
  {
    id: 'blockquote',
    icon: <ShortTextIcon />,
    onClick: onBlockquoteClick,
  }], [{
    id: 'bold',
    icon: <FormatBold />,
    onClick: onBoldClick,
  }, {
    id: 'italic',
    icon: <FormatItalic />,
    onClick: onItalicClick,
  }, {
    id: 'underline',
    icon: <FormatUnderlined />,
    onClick: onUnderlineClick,
  }, {
    id: 'code',
    icon: <Code />,
    onClick: onCodeClick,
  }, {
    id: 'md-block',
    icon: <MenuHeaderIcon str="md" />,
    onClick: onMdBlockClick,
  }, {
    id: 'img',
    icon: <Image />,
    onClick: onImgClick,
  },
  {
    id: 'file',
    icon: <FileOpenIcon />,
    onClick: onFileClick,
  },
  {
    id: 'link',
    icon: <AttachFileIcon />,
    onClick: onLinkClick,
  }]]

  useEffect(() => {
    console.log('useEffect')
  }, [])

  return (
    <Box
      sx={{
      }}

    >

      <Card
        sx={{
          transition: 'all 0.2s ease-in-out',
          position: 'fixed',
          zIndex: floatVisible ? 10 : -1,
          top: {
            xs: `${floatPosition.top + floatPosition.height}px`,
            sx: `${floatPosition.top + floatPosition.height}px`,
            md: `${floatPosition.top - 80}px`,
            lg: `${floatPosition.top - 80}px`,
            xl: `${floatPosition.top - 80}px`,

          },
          left: {
            xs: `${floatPosition.left + 0}px`,
            sm: `${floatPosition.left + 0}px`,
            md: `${floatPosition.left + 0}px`,
            lg: `${floatPosition.left + 0}px`,
            xl: `${floatPosition.left + 0}px`,

          },
          opacity: floatVisible ? 1 : 0,
          height: '80px',
        }}

      >
        <Box>
          {/* https://github.com/facebook/draft-js/issues/275 */}
          {menuItems[0].map(({ id, icon, onClick }) => (
            <IconButton
              sx={{
                width: '40px',
                height: '40px',
              }}
              key={id}
              onClick={onClick}
              onMouseDown={(e) => e.preventDefault()}
            >
              {icon}
            </IconButton>
          ))}
        </Box>
        <Box>
          {/* https://github.com/facebook/draft-js/issues/275 */}
          {menuItems[1].map(({ id, icon, onClick }) => (
            <IconButton
              sx={{
                width: '40px',
                height: '40px',
              }}
              key={id}
              onClick={onClick}
              onMouseDown={(e) => e.preventDefault()}
            >
              {icon}
            </IconButton>
          ))}
        </Box>

      </Card>
      <Box
        ref={editorContainer}
        sx={{
          paddingTop: 1,

          ...readOnly ? {} : { backgroundColor: 'rgba(255,255,0,0.05)' },
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
            ref={editor}
            blockRendererFn={customBlockRenderer}
            readOnly={readOnly || tempReadOnly}
            onBlur={onBlur}
            placeholder={t('Write something...')}
            editorState={state.editorState}
            handleKeyCommand={handleKeyCommand}
            handlePastedFiles={handlePastedFiles}
            onChange={onChange}
            blockStyleFn={customBlockStyleFn}
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
