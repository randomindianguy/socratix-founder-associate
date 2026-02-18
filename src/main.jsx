import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import SocratixPositioning from './SocratixPositioning'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SocratixPositioning />
    <Analytics />
  </React.StrictMode>
)
