/** Três bipes curtos gerados na hora, sem arquivo de áudio. */
export function tocarSom() {
  try {
    const audio = new AudioContext()
    ;[0, 0.25, 0.5].forEach((atraso) => {
      const osc = audio.createOscillator()
      const volume = audio.createGain()
      osc.frequency.value = 880
      volume.gain.setValueAtTime(0.2, audio.currentTime + atraso)
      volume.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + atraso + 0.2)
      osc.connect(volume).connect(audio.destination)
      osc.start(audio.currentTime + atraso)
      osc.stop(audio.currentTime + atraso + 0.2)
    })
    window.setTimeout(() => void audio.close(), 1000)
  } catch {
    // Web Audio unavailable: the on-screen notice is enough.
  }
}

export const notificacaoSuportada = () => typeof window !== 'undefined' && 'Notification' in window

export function notificar(tarefa: string) {
  if (notificacaoSuportada() && Notification.permission === 'granted') {
    new Notification('Ciclo concluído', { body: `${tarefa}: hora de uma pausa.`, tag: 'ignite-timer' })
  }
}
