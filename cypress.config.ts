import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        log (message) {
          console.log(message)
          return null
        }
      })
    },
    defaultCommandTimeout: 10000,
    specPattern: '__tests__/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
})
