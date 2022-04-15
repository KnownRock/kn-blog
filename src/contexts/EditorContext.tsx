import { Editor, EditorState } from 'draft-js'
import React, { createContext } from 'react'

export default createContext<{
  stateRef: React.MutableRefObject<{ editorState: EditorState }>,
  setState:(state: { editorState: EditorState }) => void,
  readOnly: boolean,
  setTempReadOnly: (readOnly: boolean) => void,
  editor:React.RefObject<Editor>
}>({
      stateRef: { current: {} as { editorState: EditorState } },
      setState: () => {},
      readOnly: false,
      setTempReadOnly: () => {},
      editor: React.createRef<Editor>(),
    })
