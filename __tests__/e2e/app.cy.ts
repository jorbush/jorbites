describe('Basic render', () => {
    it('should render the baic home components', () => {
        cy.visit('http://localhost:3000/');
        cy.get('[data-cy="logo"]');
    });
});
