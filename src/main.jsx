import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import './index.css'
import App from './App'
import Docs from './Docs'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/docs/:page" element={<Docs />} />
    </Routes>
  </BrowserRouter>
)
