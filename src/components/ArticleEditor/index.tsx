import {
  Component, useCallback, useEffect, useMemo, useRef, useState,
} from 'react'
import {
  AtomicBlockUtils,
  ContentBlock,
  ContentState,
  convertFromRaw,
  convertToRaw,
  DraftEditorCommand, Editor, EditorState, Modifier, RawDraftContentState, RichUtils,
} from 'draft-js'
import {
  Box, Button, Card, IconButton,
} from '@mui/material'

import FormatBold from '@mui/icons-material/FormatBold'
import FormatItalic from '@mui/icons-material/FormatItalic'
import FormatUnderlined from '@mui/icons-material/FormatUnderlined'

import Code from '@mui/icons-material/Code'
import Image from '@mui/icons-material/Image'

import './index.css'
import { useTranslation } from 'react-i18next'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import { useSelectImg } from '../../hooks/useSelectImg'
// eslint-disable-next-line react/prefer-stateless-function
// class MediaComponent extends Component {
//   render() {
//     const { block, contentState } = this.props
//     const { foo } = this.props.blockProps
//     const data = contentState.getEntity(block.getEntityAt(0)).getData()

//     return (
//       <div className="media-wrapper">
//         <img src={data.src} />
//       </div>
//     )
//   }
// }

function MediaComponent(props:{
  block: ContentBlock,
  contentState: ContentState,
  blockProps: any,
}) {
  const {
    block, contentState, blockProps,
  } = props
  // const { foo } = blockProps
  const data = contentState.getEntity(block.getEntityAt(0)).getData()
  const mediaType = data.type

  const handleFileClick = useCallback(() => {
    const a = document.createElement('a')
    a.href = data.src
    a.download = data.src
    a.click()
  }, [data])

  const mediaNode = useMemo(() => {
    if (mediaType === 'image') {
      return (
        <>
          <img
            style={{
              maxHeight: data.maxHeight,
              maxWidth: data.maxWidth,
            }}
            src={data.src}
            alt={data.alt}
            height={data.height}
            width={data.width}
          />
          <span>{data.alt}</span>
        </>
      )
    }
    if (mediaType === 'file') {
      return (
        <Button variant="outlined" onClick={handleFileClick} startIcon={<AttachFileIcon />}>
          {data.fileName}
        </Button>
      )
    }

    return (
      <Box>not found</Box>
    )
  }, [mediaType, data, handleFileClick])

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
  readonly = false,
}:{
  contentState?: RawDraftContentState | undefined;
  onContentStateChange?: (contentState: RawDraftContentState) => void;
  readonly?: boolean;
}) {
  const { getImgAsDataUrl } = useSelectImg()
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
    const selectionText = document?.getSelection?.()?.toString() ?? 'image'

    getImgAsDataUrl().then((dataUrl) => {
      if (!dataUrl) return

      const entityKey = state.editorState // from STATE
        .getCurrentContent()
        .createEntity('atomic', 'MUTABLE', {
          src: dataUrl,
          maxHeight: '600px',
          maxWidth: '600px',
          type: 'image',
          alt: selectionText,
        }).getLastCreatedEntityKey()

      // NEW EDITOR STATE
      const newEditorState = AtomicBlockUtils.insertAtomicBlock(
        state.editorState,
        entityKey,
        ' ',
      )
      onChange(newEditorState)
    })
  }

  const onFileClick = async () => {
    const selectionText = document?.getSelection?.()?.toString() ?? 'file'

    getImgAsDataUrl().then((dataUrl) => {
      if (!dataUrl) return

      const entityKey = state.editorState // from STATE
        .getCurrentContent()
        .createEntity('atomic', 'MUTABLE', {
          src: dataUrl,
          maxHeight: '600px',
          maxWidth: '600px',
          type: 'file',
          fileName: selectionText,
        }).getLastCreatedEntityKey()

      // NEW EDITOR STATE
      const newEditorState = AtomicBlockUtils.insertAtomicBlock(
        state.editorState,
        entityKey,
        ' ',
      )
      onChange(newEditorState)
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

          // width: '100px',
          height: '40px',
          // backgroundColor: 'rgba(255,255,255,1)',
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
          ...readonly ? {} : { backgroundColor: 'rgba(255,255,0,0.1)' },
        }}

      >

        <Editor
          blockRendererFn={myBlockRenderer}
          readOnly={readonly}
          onBlur={onBlur}
          placeholder={t('Write something...')}
          editorState={state.editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={onChange}
          blockStyleFn={myBlockStyleFn}
          onTab={onTab}
        />
      </Box>
    </Box>
  )
}

ArticleEditor.defaultProps = {
  contentState: undefined,
  onContentStateChange: () => {},
}

export default ArticleEditor
