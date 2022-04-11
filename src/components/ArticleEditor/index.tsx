import {
  createContext, Dispatch,
  SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react'
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
  Box, Button, Card, IconButton,
} from '@mui/material'
import { useDropzone } from 'react-dropzone'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import FormatBold from '@mui/icons-material/FormatBold'
import FormatItalic from '@mui/icons-material/FormatItalic'
import FormatUnderlined from '@mui/icons-material/FormatUnderlined'

import Code from '@mui/icons-material/Code'
import Image from '@mui/icons-material/Image'

import './index.css'
import { useTranslation } from 'react-i18next'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import mime from 'mime'
import { useSelectFile, useSelectImg, useSettingFileTypeAndName } from '../../hooks/use-selector'
import { convertBlobsToDataUrlWithFileName, convertFilesToDataUrlWithFileName } from '../../utils/file-tools'

const EditorContext = createContext<{
  state: { editorState: EditorState },
  setState:(state: { editorState: EditorState }) => void,
  readOnly: boolean,
}>({
      state: { editorState: EditorState.createEmpty() },
      setState: () => {},
      readOnly: false,
    })

function MediaComponent(props:{
  block: ContentBlock,
  contentState: ContentState,
  blockProps: any,
}) {
  const {
    block, contentState, blockProps,
  } = props

  const { state, setState, readOnly } = useContext(EditorContext)
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
    if (readOnly) return

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

    // function deepCopyEntities(obj:{ [k:string]:any }) {
    //   const entityKeys = Object.keys(obj)
    //   const newEntityMap = {}
    //   entityKeys.forEach((key) => {
    //     const entity = obj[key]
    //     const newEntity = {
    //       ...entity,
    //       mutability: 'IMMUTABLE',
    //       data: {
    //         ...entity.data,
    //         fileName,
    //         displayName,
    //       },
    //     }
    //     newEntityMap[key] = newEntity
    //   })
    //   return newEntityMap
    // }

    // const currentContentState = state.editorState.getCurrentContent()
    // // debugger
    // // const clonedContentState = ContentState.createFromBlockArray(
    // //   currentContentState.getBlockMap().toArray(),
    // //   JSON.parse(JSON.stringify(currentContentState.getAllEntities().toJS())),
    // //   // deepCopyEntities(currentContentState.getAllEntities().toJS()),
    // // )
    // const clonedContentState = new ContentState({
    //   blockMap: currentContentState.getBlockMap().toArray(),
    //   entityMap: deepCopyEntities(currentContentState.getAllEntities().toJS()),
    // })
    // console.log(clonedContentState.getAllEntities() == currentContentState.getAllEntities())
    // debugger

    // clonedContentState.mergeEntityData(block.getEntityAt(0), {
    //   type: fileType,
    //   alt: displayName,
    //   fileName,
    //   displayName,
    // })

    // // clonedContentState.set

    // debugger

    // // TODO: add redo stack
    // // FIXME: make it immutable
    // const es = EditorState.push(state.editorState, clonedContentState, 'change-block-data')
    // setState({
    //   editorState: es,
    // })

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
              height: 0,
              // right: 0,
              // width: '100%',
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
            <IconButton color="warning" onClick={handleRemove}>
              <RemoveCircleOutlineIcon />
            </IconButton>
            )}
            <Button variant="outlined" onClick={handleFileClick} startIcon={<AttachFileIcon />}>
              {data.displayName || data.fileName}
            </Button>

          </Box>
        </Box>
      )
    }

    return (
      <Box>not found</Box>
    )
  }, [mediaType, handleImgClick, readOnly,
    handleRemove, data.maxHeight,
    data.maxWidth, data.src, data.alt,
    data.height, data.width, data.displayName, data.fileName, handleFileClick])

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
    </Box>
  )
}
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

  const addCustomizedBlock = (
    { blockType, dataUrl, fileName }:DataUrlWithFileName & { blockType:'image' | 'file' },
  ) => {
    if (blockType === 'image') {
      const entityKey = state.editorState // from STATE
        .getCurrentContent()
        .createEntity('atomic', 'IMMUTABLE', {
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
        .createEntity('atomic', 'IMMUTABLE', {
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
    onChange(RichUtils.toggleBlockType(state.editorState, 'code-block'))
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
  }), [state, readOnly])

  // const setEditorState = useMemo(() => ((editorState: EditorState) => {
  //   setState({ editorState })
  // }), [])

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
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...!readOnly ? getRootProps() : {}}
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
            readOnly={readOnly}
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
