import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '0.5rem',
            fontSize: '0.82rem',
            letterSpacing: '0.02em',
            fontFamily: 'DM Sans, sans-serif',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
