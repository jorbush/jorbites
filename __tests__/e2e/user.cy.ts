describe('User', () => {
    it('should login and logout', () => {
        cy.visit('http://localhost:3000/');

        cy.get('.text-lg').eq(0).should('have.text', 'a');

        // Login
        cy.get('[data-cy="user-menu"]', { timeout: 10000 }).should('be.visible').click();
        cy.get('[data-cy="user-menu-login"]', { timeout: 10000 }).should('be.visible').click();
        cy.get('[data-cy="login-email"]').type(Cypress.env('userTestEmail'));
        cy.get('[data-cy="login-password"]').type(Cypress.env('userTestPassword'));
        cy.get('[data-cy="modal-action-button"]').click();

        // Wait for login process to complete
        cy.wait(5000);

        // Logout
        cy.get('[data-cy="user-menu"]', { timeout: 10000 }).should('be.visible').click({ force: true });
        cy.get('[data-cy="user-menu-logout"]', { timeout: 10000 }).should('be.visible').click({ force: true });

        // Wait for logout process to complete
        cy.wait(20000);

        cy.get('[data-cy="user-menu"]', { timeout: 10000 }).should('be.visible').click({ force: true });
        cy.get('[data-cy="user-menu-logout"]').should('not.exist');
        cy.get('[data-cy="user-menu-login"]').should('be.visible');
    });
});
