/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Security headers applied in dev server
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.NODE_ENV === 'production' ? '/StudentCommonSpace/' : '/',
  server: {
    headers: securityHeaders,
  },
  preview: {
    headers: securityHeaders,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/e2e/**', // Exclude root e2e directory
      '**/tests/e2e/**', // Exclude Playwright e2e tests
    ],
  },
})
