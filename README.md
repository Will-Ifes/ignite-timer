<p align="center">
  <img src="./.github/readme-cover.svg" alt="Focus Cycles: Tempo, transições e histórico de tarefas." width="100%" />
</p>

# Ignite Timer · ciclos de foco

Temporizador de tarefas com histórico e persistência local.

Projeto de estudo da trilha Ignite da Rocketseat: React, TypeScript, Context, reducer, React Router, React Hook Form, Zod e styled-components.

## Explore o diferencial

| Ponto de entrada | O que observar |
| --- | --- |
| [Estado com transições](src/reducers/cycles/reducer.ts) | O reducer explicita como um ciclo muda ao iniciar, interromper ou concluir. |
| [Tempo e persistência](src/contexts/CyclesContext.tsx) | O contexto reúne ciclos e armazenamento local para alimentar as telas. |

## Destaques

- Criação de ciclos com tarefa e duração.
- Contagem regressiva, interrupção e conclusão.
- Histórico gravado no localStorage.

<details>
<summary><strong>Organização e código</strong></summary>

### Por dentro do código

| Código | O que observar |
| --- | --- |
| [`src/contexts/CyclesContext.tsx`](src/contexts/CyclesContext.tsx) | Estado, tempo e persistência. |
| [`src/reducers/cycles/reducer.ts`](src/reducers/cycles/reducer.ts) | Transições dos ciclos. |
| [`src/pages/Home/components/Countdown/index.tsx`](src/pages/Home/components/Countdown/index.tsx) | Contagem regressiva. |
| [`src/pages/History/index.tsx`](src/pages/History/index.tsx) | Histórico. |

</details>

<details>
<summary><strong>Executar e consultar</strong></summary>

### Executar localmente

Requer Node.js e npm compatíveis com as dependências versionadas.

```bash
git clone https://github.com/Will-Ifes/ignite-timer.git
cd ignite-timer
npm install
npm run dev
```

Abra o endereço informado pelo servidor no terminal.

### Comandos disponíveis

| Comando | Script versionado |
| --- | --- |
| `npm run dev` | `vite` |
| `npm run build` | `tsc && vite build` |
| `npm run preview` | `vite preview` |
| `npm run lint` | `eslint src --ext .ts,.tsx --fix` |

</details>

<details>
<summary>Escopo e referências</summary>

Sem backend ou sincronização. A inicialização a partir do localStorage deve ser revisada para o primeiro acesso sem dados. Recuperação de armazenamento inválido e testes das transições também são próximos passos.

</details>

---

Mantido por **Will Oliveira** · [Perfil](https://github.com/Will-Ifes) · [LinkedIn](https://www.linkedin.com/in/wildemberg-de-jesus-oliveira/)
