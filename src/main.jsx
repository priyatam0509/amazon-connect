import React from 'react'
import ReactDOM from 'react-dom/client'
import AppComprehensive from './AppComprehensive'
import './index.css'

// For third-party applications, just render directly
// DO NOT call AmazonConnectApp.init() - that's only for Amazon's own apps
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppComprehensive />
  </React.StrictMode>,
)
