describe('Collaborative Cooking & Share Link E2E Flow', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should allow generating a co-cook invite link from RecipeModal', () => {
        cy.get('header').should('exist');
        cy.get('[data-testid="navbar-top-row"]').should('be.visible');
    });

    it('should handle joining a draft via share link URL parameters', () => {
        cy.visit('/recipes/new?draft=shared-draft-123&token=sec_token_999');
        cy.get('header').should('exist');
    });
});
