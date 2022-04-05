import {
  Routes,
  Route,
} from 'react-router-dom'

import Article from './views/Article'
import Home from './views/Home'
import Files from './views/Files'
import ImageViewer from './views/Viewers/ImageViewer'
import TextViewer from './views/Viewers/TextViewer'
import VideoViewer from './views/Viewers/VideoViewer'
import Info from './components/Info'

function App() {
  return (
    <Info>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/articles/:id" element={<Article />} />
        <Route path="/image-viewer" element={<ImageViewer />} />
        <Route path="/text-viewer" element={<TextViewer />} />
        <Route path="/video-viewer" element={<VideoViewer />} />
        <Route path="me" element={3} />
        <Route path="/files/*" element={<Files />} />
      </Routes>
    </Info>
  )
}

export default App
