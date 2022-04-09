import { useEffect, useRef, useState } from 'react'
import {
  ContentBlock,
  ContentState,
  convertFromRaw,
  convertToRaw,
  DraftEditorCommand, Editor, EditorState, RawDraftContentState, RichUtils,
} from 'draft-js'
import {
  Box, Card, IconButton,
} from '@mui/material'

import FormatBold from '@mui/icons-material/FormatBold'
import FormatItalic from '@mui/icons-material/FormatItalic'
import FormatUnderlined from '@mui/icons-material/FormatUnderlined'

import Code from '@mui/icons-material/Code'

import './index.css'
import { useTranslation } from 'react-i18next'

function ArticleEditor({
  contentState,
  onContentStateChange = () => {},
  readonly = false,
}:{
  contentState?: RawDraftContentState | undefined;
  onContentStateChange?: (contentState: RawDraftContentState) => void;
  readonly?: boolean;
}) {
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
      // downgrade to dom position
      // if (rect.top === 0 && rect.left === 0) {
      //   const selectionElement: HTMLSpanElement | null = anchorNode?.nodeType === 3
      //     ? anchorNode.parentElement as HTMLSpanElement | null
      //     : anchorNode as HTMLSpanElement | null

      //   if (selectionElement) {
      //     rect = {
      //       left: selectionElement.offsetLeft,
      //       top: selectionElement.offsetTop,
      //       // width: selectionElement.offsetWidth,
      //       // height: selectionElement.offsetHeight,
      //     }
      //   }
      // }
      // const selection = editorState.getSelection()
      // setFloatVisible(!(selection.getStartOffset() === selection.getEndOffset()))
      if (rect.width < 0.1) {
        setFloatVisible(false)
      } else {
        setFloatVisible(true)
      }

      setFloatPosition(rect)
      // console.log(rect)
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

  const myBlockStyleFn = (contentBlock: ContentBlock):string => {
    const type = contentBlock.getType()
    if (type === 'blockquote') {
      return 'knBlogBlockquote'
    }
    if (type === 'unstyled') {
      return 'knBlogUnstyled'
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

      </Card>
      <Box
        ref={editorContainer}
        sx={{
          paddingTop: 1,
          ...readonly ? {} : { backgroundColor: 'rgba(255,255,0,0.1)' },
        }}

      >

        <Editor
          readOnly={readonly}
          onBlur={onBlur}
          placeholder={t('Write something...')}
          editorState={state.editorState}
          handleKeyCommand={handleKeyCommand}
          onChange={onChange}
          blockStyleFn={myBlockStyleFn}
          onTab={(e) => {
            e.preventDefault()
          }}
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
