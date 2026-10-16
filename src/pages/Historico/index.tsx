import { Trash } from '@phosphor-icons/react'
import { useState } from 'react'
import { Link } from 'react-router'
import { useCiclos } from '../../contexts/CiclosContext'
import { estatisticas, statusDo, type Status } from '../../domain/ciclos'
import { useAgora } from '../../hooks/useAgora'
import { dataCompleta, tempoRelativo } from '../../utils/tempo'
import './styles.css'

type Filtro = 'todos' | 'concluido' | 'interrompido'

const ROTULO: Record<Status, string> = {
  andamento: 'Em andamento',
  pausado: 'Pausado',
  concluido: 'Concluído',
  interrompido: 'Interrompido',
}

export function Historico() {
  const { ciclos, ativo, remover, limparHistorico } = useCiclos()
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const agora = useAgora()
  const numeros = estatisticas(ciclos, new Date(agora))
  const visiveis = ciclos.filter((c) => filtro === 'todos' || statusDo(c) === filtro)
  const encerrados = ciclos.filter((c) => c.id !== ativo?.id).length

  function limpar() {
    if (window.confirm(`Apagar os ${encerrados} ciclos encerrados do histórico?`)) limparHistorico()
  }

  return (
    <section className="historico" aria-labelledby="historico-titulo">
      <div className="historico__topo">
        <div>
          <p className="eyebrow">Seus ciclos</p>
          <h1 id="historico-titulo">Histórico</h1>
        </div>
        {encerrados > 0 && (
          <button type="button" className="btn btn--ghost btn--perigo-texto" onClick={limpar}>
            <Trash size={18} aria-hidden="true" /> Limpar histórico
          </button>
        )}
      </div>

      <dl className="numeros">
        <div>
          <dt>Foco hoje</dt>
          <dd>
            {numeros.focoHojeMin}
            <small> min</small>
          </dd>
        </div>
        <div>
          <dt>Concluídos</dt>
          <dd>{numeros.concluidos}</dd>
        </div>
        <div>
          <dt>Interrompidos</dt>
          <dd>{numeros.interrompidos}</dd>
        </div>
        <div>
          <dt>Taxa de conclusão</dt>
          <dd>{numeros.taxaConclusao === null ? '–' : `${numeros.taxaConclusao}%`}</dd>
        </div>
      </dl>

      {ciclos.length === 0 ? (
        <div className="historico__vazio">
          <p>
            <strong>Nenhum ciclo ainda.</strong>
          </p>
          <p>
            Comece um ciclo no <Link to="/">Timer</Link>; ele aparece aqui quando terminar ou for interrompido.
          </p>
        </div>
      ) : (
        <>
          <div className="segmentado" role="group" aria-label="Filtrar ciclos">
            {(['todos', 'concluido', 'interrompido'] as const).map((f) => (
              <button key={f} type="button" aria-pressed={filtro === f} onClick={() => setFiltro(f)}>
                {f === 'todos' ? 'Todos' : f === 'concluido' ? 'Concluídos' : 'Interrompidos'}
              </button>
            ))}
          </div>

          <div className="tabela">
            <table>
              <caption className="sr-only">Ciclos {filtro === 'todos' ? '' : ROTULO[filtro].toLowerCase() + 's'}</caption>
              <thead>
                <tr>
                  <th scope="col">Tarefa</th>
                  <th scope="col">Duração</th>
                  <th scope="col">Início</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((c) => {
                  const status = statusDo(c)
                  return (
                    <tr key={c.id}>
                      <th scope="row">{c.tarefa}</th>
                      <td>{c.minutos} min</td>
                      <td>
                        <time dateTime={c.inicio} title={dataCompleta(c.inicio)}>
                          {tempoRelativo(c.inicio, agora)}
                        </time>
                      </td>
                      <td>
                        <span className="status" data-status={status}>
                          {ROTULO[status]}
                        </span>
                      </td>
                      <td className="tabela__acao">
                        {c.id !== ativo?.id && (
                          <button type="button" className="btn btn--ghost btn--icon" onClick={() => remover(c.id)} aria-label={`Apagar ciclo ${c.tarefa}`}>
                            <Trash size={18} aria-hidden="true" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {visiveis.length === 0 && <p className="historico__sem-filtro">Nenhum ciclo com este filtro.</p>}
          </div>
        </>
      )}
    </section>
  )
}
