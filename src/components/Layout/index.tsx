import { ClockCountdown, Moon, Scroll, Sun } from '@phosphor-icons/react'
import { NavLink, Outlet } from 'react-router'
import { useCiclos } from '../../contexts/CiclosContext'
import { useTema } from '../../hooks/useTema'
import './styles.css'

export function Layout() {
  const { tema, alternar } = useTema()
  const { ativo } = useCiclos()
  const escuro = tema === 'forest'

  return (
    <div className="layout">
      <header className="topo">
        <div className="topo__marca">
          <span className="topo__selo" aria-hidden="true" />
          <span className="eyebrow">Lab 03 / Timer</span>
        </div>
        <nav aria-label="Principal">
          <ul className="topo__nav">
            <li>
              <NavLink to="/" end>
                <ClockCountdown size={20} aria-hidden="true" />
                Timer
                {ativo && <span className="topo__ponto" aria-label="(ciclo em andamento)" />}
              </NavLink>
            </li>
            <li>
              <NavLink to="/historico">
                <Scroll size={20} aria-hidden="true" />
                Histórico
              </NavLink>
            </li>
          </ul>
        </nav>
        <button type="button" className="btn btn--outline btn--icon topo__tema" onClick={alternar} aria-pressed={escuro} aria-label="Tema escuro">
          {escuro ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
        </button>
      </header>
      <main id="conteudo" className="conteudo">
        <Outlet />
      </main>
    </div>
  )
}
