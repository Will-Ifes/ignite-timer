/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O GitHub Pages publica em https://will-ifes.github.io/ignite-timer/
export default defineConfig({
  base: '/ignite-timer/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
