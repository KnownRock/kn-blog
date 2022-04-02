import {
  Routes,
  Route,
} from 'react-router-dom'

import Article from './views/Article'
import Home from './views/Home'
import Files from './views/Files'

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home />
      }
      />
      <Route
        path="/articles/:id"
        element={
          <Article />
        }
      />
      <Route path="me" element={3} />
      <Route
        path="/files/*"
        element={
          <Files />
      }
      />
    </Routes>
  )
}

export default App
