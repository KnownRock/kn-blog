import {
  AppBar, Box, IconButton, Input, Toolbar, Typography,
} from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'

import Draggable from 'react-draggable'

import { Resizable, ResizableBox } from 'react-resizable'

export default function Desktop() {
  const ref = useRef<HTMLDivElement>(null)
  const [url, setUrl] = useState('http://localhost:23030/files')
  const [width, setWidth] = useState(300)
  const [height, setHeight] = useState(300)

  function onResize(event: any, { size }: any) {
    setWidth(size.width)
    setHeight(size.height)
  }

  return (
    <ResizableBox resizeHandles={['sw', 'se', 'nw', 'ne', 'w', 'e', 'n', 's']} className="box" width={200} height={200}>
      <span className="text">{'<ResizableBox>'}</span>
    </ResizableBox>
  )

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        backgroundColor: '#999',
        overflow: 'hidden',
      }}
    >
      <Draggable
        nodeRef={ref}
        axis="both"
        defaultPosition={{ x: 0, y: 0 }}
        scale={1}
      >

        <div
          ref={ref}
          style={{
            width: '300px',
            height: '300px',
          }}
        >
          <AppBar position="static">
            <Toolbar variant="dense">
              <Typography variant="h6" color="inherit" component="div">
                Drag
              </Typography>
            </Toolbar>
          </AppBar>
          <Box onMouseDown={(e) => e.stopPropagation()} onMouseUp={(e) => e.stopPropagation()}>
            <div style={{ width: `${width}px`, height: `${height}px` }}>
              <span>Contents</span>
            </div>
          </Box>

        </div>
      </Draggable>

      {/* <iframe
        sandbox="allow-scripts"
        ref={ref}
        style={{
          border: '0',
          height: '50vh',
          width: '50%',
        }}
        src={url}
        title="ifr"
      /> */}
    </Box>
  )
}
