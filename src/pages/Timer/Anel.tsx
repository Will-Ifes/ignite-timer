import type { ReactNode } from 'react'

const RAIO = 140
const CIRCUNFERENCIA = 2 * Math.PI * RAIO

/** Anel de progresso em SVG; o texto do tempo fica no centro, fora do SVG. */
export function Anel({ progresso, pausado, children }: { progresso: number; pausado: boolean; children: ReactNode }) {
  return (
    <div className="anel" data-pausado={pausado || undefined}>
      <svg viewBox="0 0 320 320" aria-hidden="true">
        <circle className="anel__trilho" cx="160" cy="160" r={RAIO} />
        <circle
          className="anel__progresso"
          cx="160"
          cy="160"
          r={RAIO}
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={CIRCUNFERENCIA * (1 - Math.min(1, Math.max(0, progresso)))}
        />
      </svg>
      <div className="anel__centro">{children}</div>
    </div>
  )
}
