import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'

export const server = "https://nexus-v1-r12b.onrender.com"

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  // StrictMode>
)
