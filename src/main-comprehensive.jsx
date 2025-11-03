import React from 'react'
import ReactDOM from 'react-dom/client'
import AppComprehensive from './AppComprehensive'
import './index.css'

/**
 * Main entry point for the Comprehensive Amazon Connect Application
 * This version includes all SDK features and comprehensive UI
 */

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppComprehensive />
  </React.StrictMode>,
)
