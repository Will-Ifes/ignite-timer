import { useEffect, useRef, useState } from 'react'
import { restanteMs, type Ciclo } from '../domain/ciclos'

const TITULO_PADRAO = 'Ignite Timer · Pomodoro'

export const formatarTempo = (msRestante: number) => {
  const total = Math.ceil(msRestante / 1000)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/**
 * Atualiza a contagem 4 vezes por segundo a partir do relógio do sistema
 * (não acumula atraso como somar +1 a cada setInterval) e conclui o ciclo ao zerar.
 */
export function useRelogio(ativo: Ciclo | null, onConcluir: () => void) {
  const [agora, setAgora] = useState(() => Date.now())
  const concluir = useRef(onConcluir)

  useEffect(() => {
    concluir.current = onConcluir
  })

  const rodando = ativo !== null && !ativo.pausadoEm

  useEffect(() => {
    if (!rodando) return
    const id = window.setInterval(() => setAgora(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [rodando])

  const restante = ativo ? restanteMs(ativo, agora) : 0

  useEffect(() => {
    if (ativo && restante === 0) concluir.current()
  }, [ativo, restante])

  const texto = formatarTempo(restante)
  useEffect(() => {
    document.title = ativo ? `${ativo.pausadoEm ? '⏸ ' : ''}${texto} · ${ativo.tarefa}` : TITULO_PADRAO
  }, [ativo, texto])

  useEffect(() => () => {
    document.title = TITULO_PADRAO
  }, [])

  return { restante, texto, progresso: ativo ? 1 - restante / (ativo.minutos * 60_000) : 0 }
}
