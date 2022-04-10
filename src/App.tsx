import {
  Routes,
  Route,
} from 'react-router-dom'

import process from 'process'
import Article from './views/Article'
import Home from './views/Home'
import Files from './views/Files'
import ImageViewer from './views/Viewers/ImageViewer'
import TextViewer from './views/Viewers/TextViewer'
import VideoViewer from './views/Viewers/VideoViewer'
import Info from './components/Info'
import ArticleViewer from './views/Viewers/ArticleViewer'

window.process = process

function App() {
  return (
    <Info>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/articles/:id" element={<Article />} />

        <Route path="/image-viewer/*" element={<ImageViewer />} />
        <Route path="/text-viewer/*" element={<TextViewer />} />
        <Route path="/video-viewer/*" element={<VideoViewer />} />
        <Route path="/article-viewer/*" element={<ArticleViewer />} />

        <Route path="/files/*" element={<Files />} />

        <Route path="me" element={3} />

      </Routes>
    </Info>
  )
}

export default App
