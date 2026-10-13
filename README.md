# Ignite Timer · ciclos de foco

Temporizador de tarefas com histórico e persistência local.

## Contexto e objetivo

Projeto de estudo da trilha Ignite da Rocketseat: React, TypeScript, Context, reducer, React Router, React Hook Form, Zod e styled-components.

## Funcionalidades presentes

- Criação de ciclos com tarefa e duração.
- Contagem regressiva, interrupção e conclusão.
- Histórico gravado no localStorage.

## Por dentro do código

| Código | O que observar |
| --- | --- |
| [`src/contexts/CyclesContext.tsx`](src/contexts/CyclesContext.tsx) | Estado, tempo e persistência. |
| [`src/reducers/cycles/reducer.ts`](src/reducers/cycles/reducer.ts) | Transições dos ciclos. |
| [`src/pages/Home/components/Countdown/index.tsx`](src/pages/Home/components/Countdown/index.tsx) | Contagem regressiva. |
| [`src/pages/History/index.tsx`](src/pages/History/index.tsx) | Histórico. |

## Executar localmente

Requer Node.js e npm compatíveis com as dependências versionadas.

```bash
git clone https://github.com/Will-Ifes/ignite-timer.git
cd ignite-timer
npm install
npm run dev
```

Abra o endereço informado pelo servidor no terminal.



## Comandos disponíveis

| Comando | Script versionado |
| --- | --- |
| `npm run dev` | `vite` |
| `npm run build` | `tsc && vite build` |
| `npm run preview` | `vite preview` |
| `npm run lint` | `eslint src --ext .ts,.tsx --fix` |

Os comandos refletem o `package.json`. A existência de um script não comprova execução bem-sucedida no ambiente atual.

## Escopo e evolução

Sem backend ou sincronização. A inicialização a partir do localStorage deve ser revisada para o primeiro acesso sem dados. Recuperação de armazenamento inválido e testes das transições também são próximos passos.

---

Mantido por **Will Oliveira** · [Perfil](https://github.com/Will-Ifes) · [LinkedIn](https://www.linkedin.com/in/wildemberg-de-jesus-oliveira/)
