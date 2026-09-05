describe('User', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should login and logout', () => {
        // Login
        cy.get('[data-cy="user-menu"]').click();
        cy.get('[data-cy="user-menu-login"]').should('be.visible').click();
        cy.env(['userTestEmail', 'userTestPassword']).then(
            ({ userTestEmail, userTestPassword }) => {
                cy.get('[data-cy="login-email"]').type(userTestEmail);
                cy.get('[data-cy="login-password"]').type(userTestPassword);
                cy.get('[data-cy="modal-action-button"]').click();
                cy.get('body').should('not.contain', 'Invalid credentials');
                cy.get('[data-cy="login-modal"]').should('not.exist');
                cy.get('[class^="go"]').should('be.visible');
                // Logout
                cy.get('[data-cy="user-menu"]').click();
                cy.get('[data-cy="user-menu-logout"]').click();
                cy.get('[data-cy="user-menu"]').click();
                cy.get('[data-cy="user-menu-logout"]').should('not.exist');
                cy.get('[data-cy="user-menu-login"]').should('be.visible');
            }
        );
    });
});
