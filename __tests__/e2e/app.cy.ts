describe('Basic render', () => {
    it('should render the basic home components', () => {
        cy.visit('/');
        cy.get('[data-cy="logo"]').should('be.visible');
    });
});
