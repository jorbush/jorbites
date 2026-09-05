/// <reference types="cypress" />

Cypress.Commands.add('login', (email?: string, password?: string) => {
    cy.env(['userTestEmail', 'userTestPassword']).then((envVars) => {
        const userEmail = email || envVars.userTestEmail;
        const userPassword = password || envVars.userTestPassword;

        cy.session(
            [userEmail, userPassword],
            () => {
                cy.visit('/');
                cy.get('[data-cy="user-menu"]').click();
                cy.get('[data-cy="user-menu-login"]').should('be.visible').click();
                cy.get('[data-cy="login-email"]').type(userEmail);
                cy.get('[data-cy="login-password"]').type(userPassword);
                cy.get('[data-cy="modal-action-button"]').click();
                cy.get('[class^="go"]', { timeout: 10000 }).should('be.visible');
                cy.get('[data-cy="login-modal"]', { timeout: 10000 }).should('not.exist');
            },
            {
                cacheAcrossSpecs: true,
            }
        );
    });
});

Cypress.Commands.add('ensureEnglish', () => {
    cy.task('log', 'Setting language to English...');
    cy.get('[data-cy="user-menu"]').click();
    cy.get('[data-cy="user-menu-panel"]').should('be.visible');
    cy.get('[data-cy="user-menu-settings"]').click();
    cy.get('[data-cy="settings-modal-content"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="language-dropdown"]', { timeout: 5000 })
        .should('be.visible')
        .then(($button) => {
            const buttonText = $button.text();
            cy.task('log', `Current language: ${buttonText}`);
            if (!buttonText.includes('English')) {
                cy.wrap($button).click();
                cy.contains('English').click();
                cy.get('[data-cy="modal-action-button"]').should('be.visible').click();
                cy.get('[data-cy="settings-modal-content"]', { timeout: 10000 }).should('not.exist');
                cy.task('log', 'Language changed to English and saved');
            } else {
                cy.get('[data-testid="close-modal-button"]').should('be.visible').click();
                cy.get('[data-cy="settings-modal-content"]', { timeout: 10000 }).should('not.exist');
                cy.task('log', 'Language already set to English');
            }
        });
});

export {};

declare global {
    namespace Cypress {
        interface Chainable {
            login(email?: string, password?: string): Chainable<any>;
            ensureEnglish(): Chainable<any>;
        }
    }
}
