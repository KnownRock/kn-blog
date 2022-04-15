import Button from '@mui/material/Button'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import { useCallback, useContext } from 'react'
import { Typography } from '@mui/material'
import BlockTool from './BlockTool'
import EditorContext from '../../contexts/EditorContext'
import { useSettingFileTypeAndName } from '../../hooks/use-selector'

export default function File({
  data, block,
}: {
  block: any,
  data: any,
}): JSX.Element | null {
  const {
    stateRef, setState, readOnly,
  } = useContext(EditorContext)

  const { settingFileTypeAndName } = useSettingFileTypeAndName()

  const handleFileClick = useCallback(async () => {
    const a = document.createElement('a')
    a.href = data.src
    a.download = data.fileName
    a.target = '_blank'
    a.click()
  }, [data])

  const handleFileSetting = useCallback(async () => {
    const { fileName, fileType, displayName } = await settingFileTypeAndName({
      fileName: data.fileName,
      fileType: data.type as ('image' | 'file'),
      displayName: data.displayName,
    })

    stateRef.current.editorState
      .getCurrentContent()
      .mergeEntityData(block.getEntityAt(0), {
        type: fileType,
        alt: fileName,
        fileName,
        displayName,
      })

    setState({
      editorState: stateRef.current.editorState,
    })
  }, [block, data, setState, settingFileTypeAndName, stateRef])

  return (
    <BlockTool handleSetting={handleFileSetting} block={block}>
      {data.type === 'file' ? (
        <Button variant="outlined" onClick={handleFileClick} startIcon={<AttachFileIcon />}>
          {data.displayName || data.fileName}
        </Button>
      ) : (
        <>
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

          <Typography
            sx={{
              userSelect: 'none',
            }}
            variant="caption"
            color="textSecondary"
          >
            {data.displayName || data.alt}
          </Typography>
        </>
      )}
    </BlockTool>
  )
}
