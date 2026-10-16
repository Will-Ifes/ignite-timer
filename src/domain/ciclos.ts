export interface Ciclo {
  id: string
  tarefa: string
  minutos: number
  /** Datas em ISO 8601 para sobreviver ao JSON do localStorage */
  inicio: string
  pausadoEm?: string
  pausaTotalMs: number
  interrompidoEm?: string
  concluidoEm?: string
}

export interface EstadoCiclos {
  ciclos: Ciclo[]
  ativoId: string | null
}

export type Status = 'andamento' | 'pausado' | 'concluido' | 'interrompido'

export type AcaoCiclos =
  | { tipo: 'iniciar'; ciclo: Ciclo }
  | { tipo: 'pausar'; agora: string }
  | { tipo: 'retomar'; agora: string }
  | { tipo: 'interromper'; agora: string }
  | { tipo: 'concluir'; agora: string }
  | { tipo: 'remover'; id: string }
  | { tipo: 'limparHistorico' }

export const ESTADO_INICIAL: EstadoCiclos = { ciclos: [], ativoId: null }

const ms = (iso: string) => new Date(iso).getTime()

export function statusDo(ciclo: Ciclo): Status {
  if (ciclo.concluidoEm) return 'concluido'
  if (ciclo.interrompidoEm) return 'interrompido'
  return ciclo.pausadoEm ? 'pausado' : 'andamento'
}

/** Tempo de foco efetivo: descontadas as pausas, e congelado enquanto pausado. */
export function decorridoMs(ciclo: Ciclo, agora: number): number {
  const fim = ciclo.pausadoEm ? ms(ciclo.pausadoEm) : agora
  return Math.max(0, fim - ms(ciclo.inicio) - ciclo.pausaTotalMs)
}

export function restanteMs(ciclo: Ciclo, agora: number): number {
  return Math.max(0, ciclo.minutos * 60_000 - decorridoMs(ciclo, agora))
}

function atualizarAtivo(estado: EstadoCiclos, mudar: (c: Ciclo) => Ciclo, encerra = false): EstadoCiclos {
  if (!estado.ativoId) return estado
  return {
    ativoId: encerra ? null : estado.ativoId,
    ciclos: estado.ciclos.map((c) => (c.id === estado.ativoId ? mudar(c) : c)),
  }
}

/** Ao encerrar um ciclo pausado, a pausa em aberto entra no total. */
function fecharPausa(c: Ciclo, agora: string): Ciclo {
  if (!c.pausadoEm) return c
  return { ...c, pausadoEm: undefined, pausaTotalMs: c.pausaTotalMs + (ms(agora) - ms(c.pausadoEm)) }
}

export function ciclosReducer(estado: EstadoCiclos, acao: AcaoCiclos): EstadoCiclos {
  switch (acao.tipo) {
    case 'iniciar':
      if (estado.ativoId) return estado
      return { ciclos: [acao.ciclo, ...estado.ciclos], ativoId: acao.ciclo.id }
    case 'pausar':
      return atualizarAtivo(estado, (c) => (c.pausadoEm ? c : { ...c, pausadoEm: acao.agora }))
    case 'retomar':
      return atualizarAtivo(estado, (c) => fecharPausa(c, acao.agora))
    case 'interromper':
      return atualizarAtivo(estado, (c) => ({ ...fecharPausa(c, acao.agora), interrompidoEm: acao.agora }), true)
    case 'concluir':
      return atualizarAtivo(estado, (c) => ({ ...fecharPausa(c, acao.agora), concluidoEm: acao.agora }), true)
    case 'remover':
      if (acao.id === estado.ativoId) return estado
      return { ...estado, ciclos: estado.ciclos.filter((c) => c.id !== acao.id) }
    case 'limparHistorico':
      return { ...estado, ciclos: estado.ciclos.filter((c) => c.id === estado.ativoId) }
  }
}

export function novoCiclo(tarefa: string, minutos: number, agora = new Date()): Ciclo {
  return { id: crypto.randomUUID(), tarefa, minutos, inicio: agora.toISOString(), pausaTotalMs: 0 }
}

export interface Estatisticas {
  focoHojeMin: number
  concluidos: number
  interrompidos: number
  taxaConclusao: number | null
}

const mesmoDia = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

export function estatisticas(ciclos: Ciclo[], agora = new Date()): Estatisticas {
  const encerrados = ciclos.filter((c) => c.concluidoEm || c.interrompidoEm)
  const concluidos = ciclos.filter((c) => c.concluidoEm).length
  const focoHojeMs = ciclos
    .filter((c) => mesmoDia(new Date(c.inicio), agora))
    .reduce((total, c) => {
      const fim = c.concluidoEm ?? c.interrompidoEm
      return total + (fim ? decorridoMs(c, ms(fim)) : decorridoMs(c, agora.getTime()))
    }, 0)
  return {
    focoHojeMin: Math.round(focoHojeMs / 60_000),
    concluidos,
    interrompidos: encerrados.length - concluidos,
    taxaConclusao: encerrados.length ? Math.round((concluidos / encerrados.length) * 100) : null,
  }
}

/** Tarefas já usadas, das mais recentes para as mais antigas, sem repetir. */
export function tarefasRecentes(ciclos: Ciclo[], limite = 6): string[] {
  return [...new Set(ciclos.map((c) => c.tarefa))].slice(0, limite)
}

interface CicloV1 {
  id: string
  task: string
  minutesAmount: number
  startDate: string
  interruptedDate?: string
  finishedDate?: string
}

/** Converte o formato salvo pela versão original do app, para ninguém perder o histórico. */
export function migrarV1(dados: { cycles?: CicloV1[]; activeCycleId?: string | null }): EstadoCiclos {
  const ciclos = (dados.cycles ?? [])
    .map(
      (c): Ciclo => ({
        id: c.id,
        tarefa: c.task,
        minutos: c.minutesAmount,
        inicio: new Date(c.startDate).toISOString(),
        pausaTotalMs: 0,
        interrompidoEm: c.interruptedDate ? new Date(c.interruptedDate).toISOString() : undefined,
        concluidoEm: c.finishedDate ? new Date(c.finishedDate).toISOString() : undefined,
      }),
    )
    .reverse()
  const ativo = ciclos.find((c) => c.id === dados.activeCycleId && !c.concluidoEm && !c.interrompidoEm)
  return { ciclos, ativoId: ativo?.id ?? null }
}
