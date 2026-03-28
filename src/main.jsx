import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../kansai-fishing-v2.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
