import { EditorState } from 'draft-js'
import { createContext } from 'react'

export default createContext<{
  state: { editorState: EditorState },
  setState:(state: { editorState: EditorState }) => void,
  readOnly: boolean,
  setTempReadOnly: (readOnly: boolean) => void,
}>({
      state: { editorState: EditorState.createEmpty() },
      setState: () => {},
      readOnly: false,
      setTempReadOnly: () => {},
    })
