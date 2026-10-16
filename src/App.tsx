import { HashRouter, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { CiclosProvider } from './contexts/CiclosContext'
import { Historico } from './pages/Historico'
import { Timer } from './pages/Timer'

// HashRouter: GitHub Pages serves only index.html, so /historico would 404 on reload with BrowserRouter.
export function App() {
  return (
    <CiclosProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Timer />} />
            <Route path="historico" element={<Historico />} />
          </Route>
        </Routes>
      </HashRouter>
    </CiclosProvider>
  )
}
