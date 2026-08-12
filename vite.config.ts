import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // `localhost` resolves to ::1 first on this machine, so Vite's default host binds
    // IPv6 loopback only — invisible to VS Code Remote's forwarder, which dials
    // 127.0.0.1 and gets a refused connection. Bind IPv4 explicitly.
    host: '127.0.0.1',
    port: 5173,
    // Fail loudly rather than drifting to 5174+ when something already holds the port,
    // so a stray dev server from another project can't masquerade as a broken app.
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
})
