import {
  Routes,
  Route,
} from 'react-router-dom'

import process from 'process'
import { Box } from '@mui/material'
import React from 'react'
import Article from './views/Article'
import Home from './views/Home'
// import Files from './views/Files'

import Info from './components/Info'

const ArticleViewer = React.lazy(() => import('./views/Viewers/ArticleViewer'))
const Files = React.lazy(() => import('./views/Files'))
const VideoViewer = React.lazy(() => import('./views/Viewers/VideoViewer'))
const TextViewer = React.lazy(() => import('./views/Viewers/TextViewer'))
const ImageViewer = React.lazy(() => import('./views/Viewers/ImageViewer'))

window.process = process

function MySuspense({
  children,
}: {
  children: JSX.Element,
}) {
  return (
    <React.Suspense fallback={<>...</>}>
      {children}
    </React.Suspense>
  )
}

function App() {
  return (
    <Info>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/articles/:id" element={<Article />} />

        <Route
          path="/files/*"
          element={(
            <MySuspense>
              <Files />
            </MySuspense>
          )}
        />
        <Route
          path="/a/*"
          element={(
            <MySuspense>
              <ImageViewer />
            </MySuspense>
          )}
        />
        <Route
          path="/image-viewer/*"
          element={(
            <MySuspense>
              <ImageViewer />
            </MySuspense>
          )}
        />
        <Route
          path="/text-viewer/*"
          element={(
            <MySuspense>
              <TextViewer />
            </MySuspense>
          )}
        />
        <Route
          path="/video-viewer/*"
          element={(
            <MySuspense>
              <VideoViewer />
            </MySuspense>
          )}
        />
        <Route
          path="/article-viewer/*"
          element={(
            <MySuspense>
              <ArticleViewer />
            </MySuspense>
          )}
        />

        <Route path="*" element={<Box />} />

        <Route path="me" element={3} />

      </Routes>
    </Info>
  )
}

export default App
