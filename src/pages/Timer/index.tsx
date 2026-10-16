import { zodResolver } from '@hookform/resolvers/zod'
import { Bell, BellSlash, HandPalm, Pause, Play } from '@phosphor-icons/react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { useCiclos } from '../../contexts/CiclosContext'
import { tarefasRecentes } from '../../domain/ciclos'
import { notificacaoSuportada, notificar, tocarSom } from '../../hooks/aviso'
import { useRelogio } from '../../hooks/useRelogio'
import { Anel } from './Anel'
import './styles.css'

const PRESETS = [15, 25, 45, 60]

// Original message said "no mínimo 5 minutos" while the schema accepted 1; now both agree.
const esquema = z.object({
  tarefa: z.string().trim().min(1, 'Diga em que você vai trabalhar.').max(60, 'Use no máximo 60 caracteres.'),
  minutos: z
    .number({ error: 'Informe os minutos.' })
    .int('Use minutos inteiros.')
    .min(1, 'O ciclo precisa ter pelo menos 1 minuto.')
    .max(60, 'O ciclo pode ter no máximo 60 minutos.'),
})

type Formulario = z.infer<typeof esquema>

export function Timer() {
  const { ciclos, ativo, iniciar, pausar, retomar, interromper, concluir } = useCiclos()
  const [ultimoConcluido, setUltimoConcluido] = useState<string | null>(null)
  const [permissao, setPermissao] = useState(() => (notificacaoSuportada() ? Notification.permission : 'denied'))

  const relogio = useRelogio(ativo, () => {
    if (!ativo) return
    concluir()
    setUltimoConcluido(ativo.tarefa)
    tocarSom()
    notificar(ativo.tarefa)
  })

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<Formulario>({ resolver: zodResolver(esquema), defaultValues: { tarefa: '', minutos: 25 } })
  const minutos = useWatch({ control, name: 'minutos' })
  const sugestoes = tarefasRecentes(ciclos)

  function comecar(dados: Formulario) {
    iniciar(dados.tarefa, dados.minutos)
    setUltimoConcluido(null)
    reset({ tarefa: '', minutos: dados.minutos })
  }

  async function pedirNotificacao() {
    setPermissao(await Notification.requestPermission())
  }

  if (ativo) {
    const pausado = Boolean(ativo.pausadoEm)
    return (
      <section className="timer" aria-labelledby="timer-titulo">
        <p className="eyebrow">{pausado ? 'Pausado' : 'Em foco'}</p>
        <h1 id="timer-titulo" className="timer__tarefa">
          {ativo.tarefa}
        </h1>
        <Anel progresso={relogio.progresso} pausado={pausado}>
          <time className="timer__tempo" aria-hidden="true">
            {relogio.texto}
          </time>
          <span className="timer__total">de {ativo.minutos} min</span>
        </Anel>
        {/* Announce only minutes to screen readers; every second would be noise */}
        <p className="sr-only" aria-live="polite">
          {pausado ? 'Ciclo pausado. ' : ''}Faltam {Math.ceil(relogio.restante / 60_000)} minutos.
        </p>
        <div className="timer__acoes">
          {pausado ? (
            <button type="button" className="btn btn--primary btn--grande" onClick={retomar}>
              <Play size={22} weight="fill" aria-hidden="true" /> Retomar
            </button>
          ) : (
            <button type="button" className="btn btn--outline btn--grande" onClick={pausar}>
              <Pause size={22} weight="fill" aria-hidden="true" /> Pausar
            </button>
          )}
          <button type="button" className="btn btn--perigo btn--grande" onClick={interromper}>
            <HandPalm size={22} aria-hidden="true" /> Interromper
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="timer" aria-labelledby="novo-titulo">
      {ultimoConcluido && (
        <p className="timer__concluido" role="status">
          Ciclo de <strong>{ultimoConcluido}</strong> concluído. Faça uma pausa antes do próximo.
        </p>
      )}
      <p className="eyebrow">Novo ciclo</p>
      <h1 id="novo-titulo" className="timer__titulo">
        No que você vai focar?
      </h1>

      <form className="novo" onSubmit={handleSubmit(comecar)} noValidate>
        <div className="campo">
          <label htmlFor="tarefa">Tarefa</label>
          <input
            id="tarefa"
            list="tarefas-recentes"
            autoComplete="off"
            placeholder="Ex.: revisar o capítulo 3"
            aria-invalid={Boolean(errors.tarefa)}
            aria-describedby={errors.tarefa ? 'tarefa-erro' : undefined}
            {...register('tarefa')}
          />
          <datalist id="tarefas-recentes">
            {sugestoes.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          {errors.tarefa && (
            <p id="tarefa-erro" className="campo__erro" role="alert">
              {errors.tarefa.message}
            </p>
          )}
        </div>

        <fieldset className="campo">
          <legend>Duração</legend>
          <div className="duracao">
            <div className="presets" role="group" aria-label="Durações prontas">
              {PRESETS.map((p) => (
                <button key={p} type="button" aria-pressed={minutos === p} onClick={() => setValue('minutos', p, { shouldValidate: true })}>
                  {p} min
                </button>
              ))}
            </div>
            <div className="duracao__livre">
              <label htmlFor="minutos" className="sr-only">
                Minutos
              </label>
              <input
                id="minutos"
                type="number"
                inputMode="numeric"
                min={1}
                max={60}
                aria-invalid={Boolean(errors.minutos)}
                aria-describedby={errors.minutos ? 'minutos-erro' : undefined}
                {...register('minutos', { valueAsNumber: true })}
              />
              <span aria-hidden="true">min</span>
            </div>
          </div>
          {errors.minutos && (
            <p id="minutos-erro" className="campo__erro" role="alert">
              {errors.minutos.message}
            </p>
          )}
        </fieldset>

        <button type="submit" className="btn btn--primary btn--grande novo__comecar">
          <Play size={22} weight="fill" aria-hidden="true" /> Começar
        </button>
      </form>

      {notificacaoSuportada() && (
        <p className="timer__notificacao">
          {permissao === 'granted' ? (
            <>
              <Bell size={18} aria-hidden="true" /> Você vai receber uma notificação ao fim de cada ciclo.
            </>
          ) : permissao === 'denied' ? (
            <>
              <BellSlash size={18} aria-hidden="true" /> Notificações bloqueadas no navegador; o aviso sonoro continua.
            </>
          ) : (
            <button type="button" className="btn btn--ghost" onClick={pedirNotificacao}>
              <Bell size={18} aria-hidden="true" /> Avisar com notificação ao terminar
            </button>
          )}
        </p>
      )}
    </section>
  )
}
