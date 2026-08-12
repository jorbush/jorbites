import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on) {
      on('task', {
        log (message) {
          console.log(message)
          return null
        }
      })
    },
    specPattern: '__tests__/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
  retries: {
    runMode: 2,
  },
})
