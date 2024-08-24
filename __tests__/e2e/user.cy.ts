describe('User', () => {
    it('should login and logout', () => {
        cy.visit('http://localhost:3000/');

        // Login
        cy.get('[data-cy="user-menu"]').click();
        cy.get('[data-cy="user-menu-login"]').should('be.visible').click();
        cy.get('[data-cy="login-email"]').type(Cypress.env('userTestEmail'));
        cy.get('[data-cy="login-password"]').type(
            Cypress.env('userTestPassword')
        );
        cy.get('[data-cy="modal-action-button"]').click();
        cy.get('[class^="go"]').should('be.visible');

        // Logout
        cy.get('[data-cy="user-menu"]').click();
        cy.get('[data-cy="user-menu-logout"]').click();
        cy.get('[data-cy="user-menu"]', { timeout: 10000 }).click();
        cy.get('[data-cy="user-menu-logout"]').should('not.exist');
        cy.get('[data-cy="user-menu-login"]').should('be.visible');
    });
});
