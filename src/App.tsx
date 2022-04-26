import {
  Routes,
  Route,
} from 'react-router-dom'

import process from 'process'
import Box from '@mui/material/Box'
import React from 'react'
import Info from './components/Info'
import TopBar from './components/TopBar'

const Home = React.lazy(() => import('./views/Home'))
const Blog = React.lazy(() => import('./views/Blog'))
const ArticleViewer = React.lazy(() => import('./views/Viewers/ArticleViewer'))
const Files = React.lazy(() => import('./views/Files'))

const VideoViewer = React.lazy(() => import('./views/Viewers/VideoViewer'))
const TextViewer = React.lazy(() => import('./views/Viewers/TextViewer'))
const ImageViewer = React.lazy(() => import('./views/Viewers/ImageViewer'))

const AppDev = React.lazy(() => import('./views/Viewers/AppDev'))

window.process = process
document.title = import.meta.env.VITE_APP_TITLE

function MySuspense({
  children,
}: {
  children: JSX.Element,
}) {
  return (
    <React.Suspense fallback={<TopBar title="" />}>
      {children}
    </React.Suspense>
  )
}

function App() {
  return (
    <Info>
      <Routes>
        <Route
          path="/"
          element={(
            <MySuspense>
              <Home />
            </MySuspense>
          )}
        />
        <Route
          path="/files/*"
          element={(
            <MySuspense>
              <Files />
            </MySuspense>
          )}
        />
        <Route
          path="/blog/*"
          element={(
            <MySuspense>
              <Blog />
            </MySuspense>
          )}
        />
        <Route
          path="/app-dev/*"
          element={(
            <MySuspense>
              <AppDev />
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

        {/* <Route path="*" element={<Box />} /> */}

        {/* <Route path="me" element={3} /> */}

      </Routes>
    </Info>
  )
}

export default App
