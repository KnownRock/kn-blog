import { Editor, EditorState } from 'draft-js'
import React, { createContext } from 'react'

export default createContext<{
  state: { editorState: EditorState },
  setState:(state: { editorState: EditorState }) => void,
  readOnly: boolean,
  setTempReadOnly: (readOnly: boolean) => void,
  editor:React.RefObject<Editor>
}>({
      state: { editorState: EditorState.createEmpty() },
      setState: () => {},
      readOnly: false,
      setTempReadOnly: () => {},
      editor: React.createRef<Editor>(),
    })
