describe('Comments', () => {
    beforeEach(() => {
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
        cy.wait(1000);

        // Create a recipe
        cy.get('[data-cy="post-recipe"]').click();
        // Fill category step
        cy.get('[data-cy="category-box-Fruits"]').click();
        cy.task('log', 'Category step filled');
        cy.get('[data-cy="modal-action-button"]').click();
        // Fill description step
        cy.get('[data-cy="recipe-title"]').type('Test recipe');
        cy.get('[data-cy="recipe-description"]').type('Test description');
        cy.task('log', 'Description step filled');
        cy.get('[data-cy="modal-action-button"]').click();
        // Fill ingredients step
        cy.get('[data-cy="recipe-ingredient-0"]').type('Test ingredient');
        cy.get('[data-cy="add-ingredient-button"]').click();
        cy.get('[data-cy="recipe-ingredient-1"]').type('Test ingredient');
        cy.task('log', 'Ingredients step filled');
        cy.get('[data-cy="modal-action-button"]').click();
        // Fill methods step
        cy.get('[data-cy="method-box-Oven"]').click();
        cy.task('log', 'Methods step filled');
        cy.get('[data-cy="modal-action-button"]').click();
        // Fill steps step
        cy.get('[data-cy="recipe-step-0"]').type('Test step');
        cy.get('[data-cy="add-step-button"]').click();
        cy.get('[data-cy="recipe-step-1"]').type('Test step');
        cy.task('log', 'Steps step filled');
        cy.get('[data-cy="modal-action-button"]').click();
        // Skip related content step
        cy.task('log', 'Related content step skipped');
        cy.get('[data-cy="modal-action-button"]').click();
        // Skip images step and create the recipe
        cy.task('log', 'Images step skipped');
        cy.get('[data-cy="modal-action-button"]').click();
        // Check if the recipe was created
        cy.task('log', 'Recipe created');
        cy.get('[class^="go"]').should('be.visible');
        cy.wait(1000);
        cy.get('.text-lg').eq(0).should('have.text', 'Test recipe').click();
        cy.task('log', 'Recipe opened');
        cy.wait(10000);

        cy.request({
            method: 'DELETE',
            url: '/api/draft',
            failOnStatusCode: false, // Don't fail the test if there's no draft to delete
        });

        // delete a test recipe if exists
        cy.get('body').then(($body) => {
            // Check if there are any recipes with "Test recipe" title
            if ($body.find('.text-lg:contains("Test recipe")').length > 0) {
                cy.get('.text-lg:contains("Test recipe")').first().click();
                cy.wait(2000); // Wait for the recipe page to load
                cy.get('[data-cy="delete-recipe"]').click();
                cy.task('log', 'Delete button clicked');
                cy.get('.text-start > .mt-2').then(($el) => {
                    cy.get('[data-cy="delete-confirmation-text"]').type(
                        $el.text().slice(1, -1)
                    );
                });
                cy.task('log', 'Confirm Text filled');
                cy.get('[data-cy="modal-action-button"]').click();
                cy.task('log', 'Delete button clicked');
                cy.get('[class^="go"]').should('be.visible');
                cy.wait(1000);
            }
        });
    });

    afterEach(() => {
        // Delete the recipe
        cy.get('[data-cy="delete-recipe"]').click();
        cy.task('log', 'Delete button clicked');
        cy.get('.text-start > .mt-2').then(($el) => {
            cy.get('[data-cy="delete-confirmation-text"]').type(
                $el.text().slice(1, -1)
            );
        });
        cy.task('log', 'Confirm Text filled');
        cy.get('[data-cy="modal-action-button"]').click();
        cy.task('log', 'Delete button clicked');
        cy.get('[class^="go"]').should('be.visible');
        cy.wait(10000);
        // Check if the recipe was deleted
        // cy.get('.text-lg').eq(0).should('not.have.text', 'Test recipe');
    });

    it('should comment a recipe and delete the comment', () => {
        // Comment the recipe
        cy.get('[data-cy="comment-input"]').type('Test comment');
        cy.get('[data-cy="submit-comment"]').click();
        cy.get('[class^="go"]').should('be.visible');
        cy.wait(1000);
        cy.get('[data-cy="comment-text"]').should('have.text', 'Test comment');
        // Delete the comment
        cy.get('[data-testid="MdDelete"]').click();
        cy.get('[data-cy="modal-action-button"]').click();
        cy.get('[class^="go"]').should('be.visible');
        cy.wait(1000);
        cy.get('[data-cy="comment-text"]').should('not.exist');
    });
});
