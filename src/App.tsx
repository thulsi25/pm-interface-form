import { ModusWcThemeProvider } from '@trimble-oss/moduswebcomponents-react'
import { setAssetPath } from '@trimble-oss/moduswebcomponents/components'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppNavbar } from './components/AppNavbar'
import { PmInterfacePage } from './pages/PmInterfacePage'
import { PmSubcontractDetailPage } from './pages/PmSubcontractDetailPage'
import { PmSubcontractsPage } from './pages/PmSubcontractsPage'

setAssetPath(`${window.location.origin}${import.meta.env.BASE_URL}`)

function AppShell() {
  return (
    <div className="root-viewport">
      <div className="app-shell">
        <AppNavbar />
        <div className="app-body-row">
          <main id="main-content">
            <Routes>
              <Route path="/" element={<PmInterfacePage />} />
              <Route path="/pm-subcontracts" element={<PmSubcontractsPage />} />
              <Route path="/pm-subcontracts/:id" element={<PmSubcontractDetailPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ModusWcThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <AppShell />
      </BrowserRouter>
    </ModusWcThemeProvider>
  )
}
