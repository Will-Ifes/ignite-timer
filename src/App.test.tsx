import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'

vi.mock('./hooks/aviso', () => ({
  tocarSom: vi.fn(),
  notificar: vi.fn(),
  notificacaoSuportada: () => false,
}))

const { tocarSom } = await import('./hooks/aviso')

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(new Date('2026-10-16T09:00:00'))
  window.location.hash = '#/'
})

afterEach(() => {
  vi.useRealTimers()
})

const usuario = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
const avancar = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

async function comecar(user: ReturnType<typeof usuario>, tarefa: string, minutos?: number) {
  await user.type(screen.getByLabelText('Tarefa'), tarefa)
  if (minutos) await user.click(screen.getByRole('button', { name: `${minutos} min` }))
  await user.click(screen.getByRole('button', { name: 'Começar' }))
}

describe('Ignite Timer', () => {
  it('abre na primeira visita sem nada salvo (o original quebrava aqui)', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'No que você vai focar?' })).toBeInTheDocument()
  })

  it('valida tarefa e minutos com mensagens coerentes', async () => {
    const user = usuario()
    render(<App />)

    await user.clear(screen.getByLabelText('Minutos'))
    await user.type(screen.getByLabelText('Minutos'), '90')
    await user.click(screen.getByRole('button', { name: 'Começar' }))

    expect(screen.getByText('Diga em que você vai trabalhar.')).toBeInTheDocument()
    expect(screen.getByText('O ciclo pode ter no máximo 60 minutos.')).toBeInTheDocument()
    expect(screen.getByLabelText('Tarefa')).toHaveAttribute('aria-invalid', 'true')
  })

  it('conta, pausa sem perder tempo, retoma e conclui com aviso', async () => {
    const user = usuario()
    render(<App />)
    await comecar(user, 'Ler artigo', 15)

    expect(screen.getByRole('heading', { name: 'Ler artigo' })).toBeInTheDocument()
    await avancar(60_000)
    expect(screen.getByText('14:00')).toBeInTheDocument()
    expect(document.title).toContain('14:00')

    await user.click(screen.getByRole('button', { name: 'Pausar' }))
    await avancar(5 * 60_000)
    expect(screen.getByText('14:00')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retomar' }))
    await avancar(14 * 60_000 + 500)

    expect(screen.getByRole('status')).toHaveTextContent('Ciclo de Ler artigo concluído')
    expect(tocarSom).toHaveBeenCalledOnce()
    expect(document.title).toBe('Ignite Timer · Pomodoro')
  })

  it('registra no histórico com estatísticas, filtro e remoção', async () => {
    const user = usuario()
    render(<App />)
    await comecar(user, 'Estudar', 15)
    await avancar(15 * 60_000 + 500)
    await comecar(user, 'Revisar')
    await avancar(10 * 60_000)
    await user.click(screen.getByRole('button', { name: 'Interromper' }))

    await user.click(screen.getByRole('link', { name: 'Histórico' }))
    const numeros = screen.getByText('Foco hoje').closest('dl')!
    expect(within(numeros).getByText('Concluídos').nextElementSibling).toHaveTextContent('1')
    expect(within(numeros).getByText('Taxa de conclusão').nextElementSibling).toHaveTextContent('50%')
    expect(within(numeros).getByText('Foco hoje').nextElementSibling).toHaveTextContent('25 min')

    await user.click(screen.getByRole('button', { name: 'Interrompidos' }))
    expect(screen.getAllByRole('row')).toHaveLength(2)
    expect(screen.getByRole('rowheader', { name: 'Revisar' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Apagar ciclo Revisar' }))
    expect(screen.getByText('Nenhum ciclo com este filtro.')).toBeInTheDocument()
  })

  it('sugere tarefas já usadas e continua o ciclo depois de recarregar', async () => {
    const user = usuario()
    const { unmount } = render(<App />)
    await comecar(user, 'Projeto final', 25)
    await avancar(5 * 60_000)
    unmount()

    render(<App />)
    expect(screen.getByRole('heading', { name: 'Projeto final' })).toBeInTheDocument()
    expect(screen.getByText('20:00')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Interromper' }))
    expect(document.querySelector('#tarefas-recentes option')).toHaveAttribute('value', 'Projeto final')
  })

  it('migra o histórico salvo pela versão original', async () => {
    localStorage.setItem(
      '@ignite-timer:cycles-state-1.0.0',
      JSON.stringify({ cycles: [{ id: '1', task: 'Ciclo antigo', minutesAmount: 25, startDate: '2026-10-15T10:00:00', finishedDate: '2026-10-15T10:25:00' }], activeCycleId: null }),
    )
    window.location.hash = '#/historico'
    render(<App />)
    expect(screen.getByRole('rowheader', { name: 'Ciclo antigo' })).toBeInTheDocument()
  })
})
