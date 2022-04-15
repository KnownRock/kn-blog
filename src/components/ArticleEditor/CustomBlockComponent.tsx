import {
  ContentBlock,
  ContentState,
} from 'draft-js'
import { useEffect, useMemo, useRef } from 'react'
import Code from './Code'
import File from './File'

export default function MediaComponent({
  block, contentState,
}: {
  block: ContentBlock;
  contentState: ContentState;
}) {
  const data = contentState.getEntity(block.getEntityAt(0)).getData()
  useEffect(() => {
    console.log('r3')
  }, [])

  const blockRef = useRef(block)
  useEffect(() => {
    blockRef.current = block
  }, [block])

  // https://stackoverflow.com/questions/58898700/how-to-enter-text-in-a-text-input-inside-an-atomic-block

  const node = useMemo(() => {
    if (data.type === 'code' || data.type === 'md-block') {
      return (
        <Code
          block={blockRef.current}
          data={data}
        />
      )
    }
    if (data.type === 'file' || data.type === 'image') {
      return (
        <File
          block={blockRef.current}
          data={data}
        />
      )
    }

    return null
  }, [blockRef, data])

  // if (mediaType === 'file' || mediaType === 'image') {
  //   return (
  //     <File
  //       block={block}
  //       data={data}
  //     />
  //   )
  // }

  return node

  // return (
  //   <Box style={{
  //     width: '100%',
  //     display: 'flex',
  //     justifyContent: 'center',
  //     alignItems: 'center',
  //     flexDirection: 'column',
  //   }}
  //   >
  //     {/* {imageNode} */}
  //     {mediaNode}
  //     {codeNode}
  //   </Box>
  // )
}
