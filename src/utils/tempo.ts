const relativo = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

const UNIDADES: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
]

/** "agora", "há 5 minutos", "ontem" — substitui o formatDistanceToNow do date-fns */
export function tempoRelativo(iso: string, agora: number): string {
  const segundos = Math.round((new Date(iso).getTime() - agora) / 1000)
  if (Math.abs(segundos) < 45) return 'agora'
  for (const [unidade, tamanho] of UNIDADES) {
    if (Math.abs(segundos) >= tamanho || unidade === 'minute') {
      return relativo.format(Math.round(segundos / tamanho), unidade)
    }
  }
  return 'agora'
}

export const dataCompleta = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
