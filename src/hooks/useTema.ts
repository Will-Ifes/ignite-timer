import { useEffect, useState } from 'react'

export type Tema = 'paper' | 'forest'
const CHAVE = 'timer:tema'

function temaInicial(): Tema {
  try {
    const salvo = localStorage.getItem(CHAVE)
    if (salvo === 'paper' || salvo === 'forest') return salvo
  } catch {
    // sem armazenamento: segue a preferência do sistema
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'forest' : 'paper'
}

/** Tema claro (papel) ou escuro (floresta), aplicado em <html data-tema>. */
export function useTema() {
  const [tema, setTema] = useState<Tema>(temaInicial)

  useEffect(() => {
    document.documentElement.dataset.tema = tema
    try {
      localStorage.setItem(CHAVE, tema)
    } catch {
      // preferência só vale nesta sessão
    }
  }, [tema])

  const alternar = () => setTema((atual) => (atual === 'paper' ? 'forest' : 'paper'))
  return { tema, alternar }
}
