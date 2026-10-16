import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import { ciclosReducer, ESTADO_INICIAL, migrarV1, novoCiclo, type Ciclo, type EstadoCiclos } from '../domain/ciclos'

const CHAVE = 'ignite-timer:ciclos:v2'
const CHAVE_V1 = '@ignite-timer:cycles-state-1.0.0'

function carregar(): EstadoCiclos {
  try {
    const atual = localStorage.getItem(CHAVE)
    if (atual) return JSON.parse(atual) as EstadoCiclos
    const antigo = localStorage.getItem(CHAVE_V1)
    // The original app crashed on first visit because this branch returned undefined.
    return antigo ? migrarV1(JSON.parse(antigo)) : ESTADO_INICIAL
  } catch {
    return ESTADO_INICIAL
  }
}

interface CiclosContexto {
  ciclos: Ciclo[]
  ativo: Ciclo | null
  iniciar: (tarefa: string, minutos: number) => void
  pausar: () => void
  retomar: () => void
  interromper: () => void
  concluir: () => void
  remover: (id: string) => void
  limparHistorico: () => void
}

const Contexto = createContext<CiclosContexto | null>(null)

export function CiclosProvider({ children }: { children: ReactNode }) {
  const [estado, despachar] = useReducer(ciclosReducer, undefined, carregar)

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado))
    } catch {
      // Without storage the timer keeps working in memory.
    }
  }, [estado])

  const agora = () => new Date().toISOString()
  const valor: CiclosContexto = {
    ciclos: estado.ciclos,
    ativo: estado.ciclos.find((c) => c.id === estado.ativoId) ?? null,
    iniciar: (tarefa, minutos) => despachar({ tipo: 'iniciar', ciclo: novoCiclo(tarefa, minutos) }),
    pausar: () => despachar({ tipo: 'pausar', agora: agora() }),
    retomar: () => despachar({ tipo: 'retomar', agora: agora() }),
    interromper: () => despachar({ tipo: 'interromper', agora: agora() }),
    concluir: () => despachar({ tipo: 'concluir', agora: agora() }),
    remover: (id) => despachar({ tipo: 'remover', id }),
    limparHistorico: () => despachar({ tipo: 'limparHistorico' }),
  }

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useCiclos() {
  const contexto = useContext(Contexto)
  if (!contexto) throw new Error('useCiclos precisa estar dentro de <CiclosProvider>')
  return contexto
}
