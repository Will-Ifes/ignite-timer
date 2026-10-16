import { describe, expect, it } from 'vitest'
import { ciclosReducer, decorridoMs, ESTADO_INICIAL, estatisticas, migrarV1, novoCiclo, restanteMs, tarefasRecentes } from './ciclos'

const t = (min: number) => new Date(Date.UTC(2026, 9, 16, 12, min)).toISOString()
const iniciar = (tarefa = 'Estudar', minutos = 25) =>
  ciclosReducer(ESTADO_INICIAL, { tipo: 'iniciar', ciclo: novoCiclo(tarefa, minutos, new Date(t(0))) })

describe('ciclos', () => {
  it('desconta pausas do tempo decorrido e congela enquanto pausado', () => {
    let estado = iniciar()
    estado = ciclosReducer(estado, { tipo: 'pausar', agora: t(10) })
    const pausado = estado.ciclos[0]!
    expect(decorridoMs(pausado, new Date(t(20)).getTime())).toBe(10 * 60_000)

    estado = ciclosReducer(estado, { tipo: 'retomar', agora: t(15) })
    const retomado = estado.ciclos[0]!
    expect(retomado.pausaTotalMs).toBe(5 * 60_000)
    expect(restanteMs(retomado, new Date(t(20)).getTime())).toBe(10 * 60_000)
  })

  it('não inicia um segundo ciclo com outro em andamento', () => {
    const estado = iniciar()
    const depois = ciclosReducer(estado, { tipo: 'iniciar', ciclo: novoCiclo('Outro', 10) })
    expect(depois).toBe(estado)
  })

  it('interromper um ciclo pausado fecha a pausa e libera o ativo', () => {
    let estado = ciclosReducer(iniciar(), { tipo: 'pausar', agora: t(5) })
    estado = ciclosReducer(estado, { tipo: 'interromper', agora: t(8) })
    expect(estado.ativoId).toBeNull()
    expect(estado.ciclos[0]).toMatchObject({ interrompidoEm: t(8), pausadoEm: undefined, pausaTotalMs: 3 * 60_000 })
  })

  it('não remove o ciclo ativo, mas remove os encerrados', () => {
    const ativo = iniciar()
    expect(ciclosReducer(ativo, { tipo: 'remover', id: ativo.ativoId! })).toBe(ativo)
    const encerrado = ciclosReducer(ativo, { tipo: 'concluir', agora: t(25) })
    expect(ciclosReducer(encerrado, { tipo: 'remover', id: encerrado.ciclos[0]!.id }).ciclos).toHaveLength(0)
  })

  it('calcula foco de hoje e taxa de conclusão', () => {
    let estado = ciclosReducer(iniciar('A', 25), { tipo: 'concluir', agora: t(25) })
    estado = ciclosReducer(estado, { tipo: 'iniciar', ciclo: novoCiclo('B', 25, new Date(t(30))) })
    estado = ciclosReducer(estado, { tipo: 'interromper', agora: t(40) })
    expect(estatisticas(estado.ciclos, new Date(t(50)))).toEqual({ focoHojeMin: 35, concluidos: 1, interrompidos: 1, taxaConclusao: 50 })
  })

  it('sugere tarefas recentes sem repetir', () => {
    const ciclos = ['A', 'B', 'A', 'C'].map((tarefa) => novoCiclo(tarefa, 5))
    expect(tarefasRecentes(ciclos)).toEqual(['A', 'B', 'C'])
  })

  it('migra o formato salvo pela versão original', () => {
    const estado = migrarV1({
      cycles: [
        { id: '1', task: 'Antigo', minutesAmount: 25, startDate: t(0), finishedDate: t(25) },
        { id: '2', task: 'Em curso', minutesAmount: 10, startDate: t(30) },
      ],
      activeCycleId: '2',
    })
    expect(estado.ativoId).toBe('2')
    expect(estado.ciclos.map((c) => c.tarefa)).toEqual(['Em curso', 'Antigo'])
    expect(estado.ciclos[1]).toMatchObject({ concluidoEm: t(25), pausaTotalMs: 0 })
  })
})
