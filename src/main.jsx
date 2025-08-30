import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import './index.css'
import App from './App'
import Docs from './Docs'

createRoot(document.getElementById('root')).render(
  <BrowserRouter basename="/gum">
    <Routes>
      <Route path="/">
        <Route index element={<App />} />
        <Route path="docs" element={<Docs />} />
        <Route path="docs/:page" element={<Docs />} />
        <Route path="*" element={<div>404</div>} />
      </Route>
    </Routes>
  </BrowserRouter>
)
