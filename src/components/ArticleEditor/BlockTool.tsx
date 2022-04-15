import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import { useTranslation } from 'react-i18next'
import SettingsIcon from '@mui/icons-material/Settings'
import SaveIcon from '@mui/icons-material/Save'
import { useCallback, useContext } from 'react'
import { ContentState, EditorState } from 'draft-js'
import EditorContext from '../../contexts/EditorContext'

export default function BlockTool({
  children, handleSetting, handleSave, block,
}: {
  children: JSX.Element | JSX.Element[];
  handleSetting?: (e: any) => void;
  handleSave?: (e: any) => void;
  block: any
}): JSX.Element | null {
  const {
    stateRef, setState, readOnly, setTempReadOnly,
  } = useContext(EditorContext)

  const handleRemove = useCallback((e) => {
    e.stopPropagation()

    const currentContentState = stateRef.current.editorState.getCurrentContent()
    const changedContentState = ContentState.createFromBlockArray(
      currentContentState
        .getBlockMap()
        .toArray()
        .filter((b) => b.getKey() !== block.getKey()),
    )
    const editorState = EditorState.push(stateRef.current.editorState, changedContentState, 'change-block-data')
    setState({
      editorState,
    })
    // setTimeout(() => {
    //   if (draftEditor.current) {
    //     draftEditor.current.focus()
    //   }
    // }, 0)
  }, [block, setState, stateRef])

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
            width: '100%',
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
