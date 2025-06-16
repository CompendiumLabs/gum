import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'

import './index.css'
import App from './App'
import Docs from './Docs'

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/docs" element={<Docs />} />
    </Routes>
  </HashRouter>
)
