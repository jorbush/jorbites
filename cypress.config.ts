import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {},
    specPattern: '__tests__/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
})
