describe('Recurrent Events E2E', () => {
    it('should display recurrent event date as "X of each month"', () => {
        cy.visit('http://localhost:3000/events');

        // Find the "29 of Gnocchis" event card and check its date display
        // We look for a card containing "29 of Gnocchis" and then check its date text
        cy.contains('h3', '29 of Gnocchis')
            .parents('div')
            .find('span')
            .should('contain', '29 of each month');
    });
});
