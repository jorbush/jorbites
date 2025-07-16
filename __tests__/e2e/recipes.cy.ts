describe('Recipes', () => {
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

        cy.request({
            method: 'DELETE',
            url: '/api/draft',
            failOnStatusCode: false, // Don't fail the test if there's no draft to delete
        });
    });

    it('should create and delete a recipe', () => {
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
        cy.wait(10000);
        cy.get('.text-lg').eq(0).should('have.text', 'Test recipe').click();
        cy.task('log', 'Recipe opened');
        cy.wait(10000);
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

    it('should create, edit, and delete a recipe', () => {
        // First, create a recipe
        cy.get('[data-cy="post-recipe"]').click();
        // Fill category step
        cy.get('[data-cy="category-box-Fruits"]').click();
        cy.task('log', 'Category step filled');
        cy.get('[data-cy="modal-action-button"]').click();
        // Fill description step
        cy.get('[data-cy="recipe-title"]').type('Original Recipe Title');
        cy.get('[data-cy="recipe-description"]').type('Original description');
        cy.task('log', 'Description step filled');
        cy.get('[data-cy="modal-action-button"]').click();
        // Fill ingredients step
        cy.get('[data-cy="recipe-ingredient-0"]').type('Original ingredient');
        cy.task('log', 'Ingredients step filled');
        cy.get('[data-cy="modal-action-button"]').click();
        // Fill methods step
        cy.get('[data-cy="method-box-Oven"]').click();
        cy.task('log', 'Methods step filled');
        cy.get('[data-cy="modal-action-button"]').click();
        // Fill steps step
        cy.get('[data-cy="recipe-step-0"]').type('Original step');
        cy.task('log', 'Steps step filled');
        cy.get('[data-cy="modal-action-button"]').click();
        // Skip related content step
        cy.task('log', 'Related content step skipped');
        cy.get('[data-cy="modal-action-button"]').click();
        // Skip images step and create the recipe
        cy.task('log', 'Images step skipped');
        cy.get('[data-cy="modal-action-button"]').click();
        // Check if the recipe was created - wait for success toast and page reload
        cy.task('log', 'Recipe created');

        // Aggressively ensure modal is closed
        cy.wait(2000); // Initial wait for modal animation

        // Try multiple methods to close modal if still open
        cy.get('body').then(($body) => {
            if ($body.find('.fixed.inset-0.z-50').length > 0) {
                cy.log('Modal still open, trying close button');
                cy.get('[data-testid="close-modal-button"]').click({
                    force: true,
                });
                cy.wait(1000);
            }
        });

        cy.get('body').then(($body) => {
            if ($body.find('.fixed.inset-0.z-50').length > 0) {
                cy.log('Modal still open, using escape key');
                cy.get('body').type('{esc}');
                cy.wait(1000);
            }
        });

        // Final check - if modal still exists, just wait longer
        cy.get('body').then(($body) => {
            if ($body.find('.fixed.inset-0.z-50').length > 0) {
                cy.log('Modal still present, waiting additional time');
                cy.wait(3000);
            }
        });

        cy.task('log', 'Modal handling completed');

        // Wait for page to fully load
        cy.get('[class^="go"]').should('be.visible');
        cy.wait(3000);
        // Ensure we're back to the homepage by checking for the expected content
        cy.url().should('eq', 'http://localhost:3000/');

        // Navigate to the created recipe - use force click to bypass any remaining overlay
        cy.contains('.text-lg', 'Original Recipe Title', { timeout: 15000 })
            .should('be.visible')
            .scrollIntoView()
            .click({ force: true });
        cy.task('log', 'Recipe opened');

        // Wait for the recipe page to load fully
        cy.url().should('include', '/recipes/');
        cy.wait(3000);

        // Now edit the recipe
        cy.get('[data-cy="edit-recipe"]').click();
        cy.task('log', 'Edit button clicked');
        cy.wait(2000);
        // Navigate to description step to edit title
        cy.get('[data-cy="modal-action-button"]').click(); // Next from category

        // Edit the title and description
        cy.get('[data-cy="recipe-title"]').clear().type('Edited Recipe Title');
        cy.get('[data-cy="recipe-description"]')
            .clear()
            .type('Edited description');
        cy.task('log', 'Title and description edited');
        cy.get('[data-cy="modal-action-button"]').click(); // Next from description

        // Edit ingredients
        cy.get('[data-cy="recipe-ingredient-0"]')
            .clear()
            .type('Edited ingredient');
        cy.task('log', 'Ingredients edited');
        cy.get('[data-cy="modal-action-button"]').click(); // Next from ingredients

        // Skip methods step
        cy.get('[data-cy="modal-action-button"]').click(); // Next from methods

        // Edit steps
        cy.get('[data-cy="recipe-step-0"]').clear().type('Edited step');
        cy.task('log', 'Steps edited');
        cy.get('[data-cy="modal-action-button"]').click(); // Next from steps

        // Skip related content step
        cy.get('[data-cy="modal-action-button"]').click(); // Next from related content

        // Update the recipe (final step - images)
        cy.get('[data-cy="modal-action-button"]').click(); // Update button
        cy.task('log', 'Recipe updated');
        cy.wait(5000);

        // Scroll to the recipe title
        cy.scrollTo('top');
        // Verify the recipe was updated
        cy.get('.text-2xl').should('contain', 'Edited Recipe Title');
        cy.task('log', 'Recipe title updated successfully');

        // Clean up - delete the recipe
        cy.get('[data-cy="delete-recipe"]').click();
        cy.task('log', 'Delete button clicked');
        cy.get('.text-start > .mt-2').then(($el) => {
            cy.get('[data-cy="delete-confirmation-text"]').type(
                $el.text().slice(1, -1)
            );
        });
        cy.task('log', 'Confirm Text filled');
        cy.get('[data-cy="modal-action-button"]').click();
        cy.task('log', 'Recipe deleted');
        cy.get('[class^="go"]').should('be.visible');
        cy.wait(5000);
    });
});
