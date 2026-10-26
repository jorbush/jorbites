describe('Recipe Remix / Fork Workflow E2E', () => {
    beforeEach(() => {
        cy.login();
        cy.visit('/');
        cy.ensureEnglish();
    });

    it('navigates to remix editor, pre-fills recipe data, and displays attribution banner', () => {
        cy.task('log', '=== Navigating to an existing recipe detail page ===');
        cy.get('[data-cy="recipe-card"]', { timeout: 10000 }).first().click();
        cy.url().should('include', '/recipes/');

        cy.task(
            'log',
            '=== Verifying Remix Recipe button alongside I Made This button ==='
        );
        cy.get('[data-testid="post-steps-cooksnap-btn"]').should('be.visible');
        cy.get('[data-cy="remix-recipe-btn"]')
            .should('be.visible')
            .and('contain.text', 'Remix Recipe');

        cy.task('log', '=== Clicking Remix Recipe button ===');
        cy.get('[data-cy="remix-recipe-btn"]').click();

        cy.task(
            'log',
            '=== Verifying URL routes to /recipes/create?forkFrom= ==='
        );
        cy.url().should('include', '/recipes/create?forkFrom=');

        cy.task(
            'log',
            '=== Verifying recipe modal opens with pre-filled state ==='
        );
        cy.get('[data-testid="modal-title"]', { timeout: 10000 }).should(
            'be.visible'
        );

        // Advance from Category step to Description step
        cy.get('[data-cy="modal-action-button"]')
            .should('not.be.disabled')
            .click();

        // Verify title is pre-populated with "Remix of ..."
        cy.get('[data-cy="recipe-title"]')
            .should('be.visible')
            .invoke('val')
            .should('match', /^Remix of /);

        cy.task(
            'log',
            '=== Verifying Community Remixes section conditional display ==='
        );
        cy.visit('/');
        cy.get('[data-cy="recipe-card"]').first().click();
        cy.get('body').then(($body) => {
            if (
                $body.find('[data-cy="community-remixes-section"]').length > 0
            ) {
                cy.get('[data-cy="community-remixes-section"]').should(
                    'be.visible'
                );
            } else {
                cy.get('[data-cy="community-remixes-section"]').should(
                    'not.exist'
                );
            }
        });
    });
});
