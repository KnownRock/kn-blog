import {
  Routes,
  Route,
} from 'react-router-dom'

import { useMemo, useState } from 'react'
import Article from './views/Article'
import Home from './views/Home'
import Files from './views/Files'
import ImageViewer from './views/Viewers/ImageViewer'
import TextViewer from './views/Viewers/TextViewer'
import VideoViewer from './views/Viewers/VideoViewer'
import InfoDialog from './components/InfoDialog'

import InfoContext from './contexts/InfoContext'

type Options = {
  title: string
  content: string
}
function App() {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<{
    title?: string,
    content?: string,
  }>({})
  const [proms, setProms] = useState<{
    resolve:(value:unknown) => void,
    reject:(value:unknown) => void,
  }>({
        resolve: () => {},
        reject: () => {},
      })

  const info = (opts:Options) => new Promise((resolve, reject) => {
    setOptions(opts)
    setOpen(true)
    setProms({
      resolve,
      reject,
    })
  })

  const infoContext = useMemo(() => ({
    info,
  }), [])

  return (
    <>
      <InfoDialog open={open} setOpen={setOpen} options={options} proms={proms} />
      <InfoContext.Provider value={infoContext}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/articles/:id" element={<Article />} />
          <Route path="/image-viewer" element={<ImageViewer />} />
          <Route path="/text-viewer" element={<TextViewer />} />
          <Route path="/video-viewer" element={<VideoViewer />} />
          <Route path="me" element={3} />
          <Route path="/files/*" element={<Files />} />
        </Routes>
      </InfoContext.Provider>
    </>
  )
}

export default App
