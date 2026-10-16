import { useEffect, useState } from 'react'

/** Horário atual que se atualiza sozinho, para o "há 3 min" não ficar parado. */
export function useAgora(intervaloMs = 30_000) {
  const [agora, setAgora] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setAgora(Date.now()), intervaloMs)
    return () => window.clearInterval(id)
  }, [intervaloMs])

  return agora
}
