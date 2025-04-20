import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
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
  numTestsKeptInMemory: 0,
})
