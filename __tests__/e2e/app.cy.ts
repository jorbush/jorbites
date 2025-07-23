describe('Jorbites E2E Tests', () => {
    before(() => {
        cy.visit('http://localhost:3000/');

        // Clean up any existing draft
        cy.request({
            method: 'DELETE',
            url: '/api/draft',
            failOnStatusCode: false,
        });
    });

    it('should complete full application workflow', () => {
        // Test 1: Basic render
        cy.log('=== Testing Basic Render ===');
        cy.get('[data-cy="logo"]').should('be.visible');

        // Test 2: User login
        cy.log('=== Testing User Login ===');
        cy.get('[data-cy="user-menu"]').click();
        cy.get('[data-cy="user-menu-login"]').should('be.visible').click();
        cy.get('[data-cy="login-email"]').type(Cypress.env('userTestEmail'));
        cy.get('[data-cy="login-password"]').type(Cypress.env('userTestPassword'));
        cy.get('[data-cy="modal-action-button"]').click();
        cy.get('body').should('not.contain', 'Invalid credentials');
        cy.get('[data-cy="login-modal"]').should('not.exist');
        cy.get('[class^="go"]').should('be.visible');
        cy.wait(1000);

        // Test 3: Recipe creation
        cy.log('=== Testing Recipe Creation ===');
        cy.get('[data-cy="post-recipe"]').click();

        // Fill category step
        cy.get('[data-cy="category-box-Fruits"]').click();
        cy.task('log', 'Category step filled');
        cy.get('[data-cy="modal-action-button"]').click();

        // Fill description step
        cy.get('[data-cy="recipe-title"]').type('E2E Test Recipe');
        cy.get('[data-cy="recipe-description"]').type('E2E Test description for consolidated testing');
        cy.task('log', 'Description step filled');
        cy.get('[data-cy="modal-action-button"]').click();

        // Fill ingredients step
        cy.get('[data-cy="recipe-ingredient-0"]').type('E2E Test ingredient 1');
        cy.get('[data-cy="add-ingredient-button"]').click();
        cy.get('[data-cy="recipe-ingredient-1"]').type('E2E Test ingredient 2');
        cy.task('log', 'Ingredients step filled');
        cy.get('[data-cy="modal-action-button"]').click();

        // Fill methods step
        cy.get('[data-cy="method-box-Oven"]').click();
        cy.task('log', 'Methods step filled');
        cy.get('[data-cy="modal-action-button"]').click();

        // Fill steps step
        cy.get('[data-cy="recipe-step-0"]').type('E2E Test step 1');
        cy.get('[data-cy="add-step-button"]').click();
        cy.get('[data-cy="recipe-step-1"]').type('E2E Test step 2');
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
        cy.wait(2000);

        // Navigate to the created recipe
        cy.get('.text-lg').eq(0).should('have.text', 'E2E Test Recipe').click();
        cy.task('log', 'Recipe opened');
        cy.wait(5000);

        // Test 4: Recipe favoriting
        cy.log('=== Testing Recipe Favoriting ===');
        // Like the recipe
        cy.get('[data-cy="heart-button"]').click();
        cy.get('[class^="go"]').should('be.visible');
        cy.wait(2000);
        cy.get('[data-testid="heart-button"]').should('have.class', 'fill-green-450');
        cy.get('[data-cy="recipe-num-likes"]').should('have.text', '1');

        // Unlike the recipe
        cy.wait(2000);
        cy.get('[data-cy="heart-button"]').click();
        cy.wait(2000);
        cy.get('[data-testid="heart-button"]').should('not.have.class', 'fill-green-450');
        cy.get('[data-cy="recipe-num-likes"]').should('have.text', '0');

        // Test 5: Comments functionality
        cy.log('=== Testing Comments ===');
        // Add a comment
        cy.get('[data-cy="comment-input"]').type('E2E test comment for verification');
        cy.get('[data-cy="submit-comment"]').click();
        cy.get('[class^="go"]').should('be.visible');
        cy.wait(2000);
        cy.get('[data-cy="comment-text"]').should('have.text', 'E2E test comment for verification');

        // Delete the comment
        cy.get('[data-testid="MdDelete"]').click();
        cy.get('[data-cy="modal-action-button"]').click();
        cy.get('[class^="go"]').should('be.visible');
        cy.wait(2000);
        cy.get('[data-cy="comment-text"]').should('not.exist');

        // Test 6: Recipe editing
        cy.log('=== Testing Recipe Editing ===');
        cy.get('[data-cy="edit-recipe"]').click();
        cy.task('log', 'Edit button clicked');
        cy.wait(2000);

        // Navigate to description step to edit title
        cy.get('[data-cy="modal-action-button"]').click(); // Next from category

        // Edit the title and description
        cy.get('[data-cy="recipe-title"]').clear().type('E2E Edited Recipe Title');
        cy.get('[data-cy="recipe-description"]').clear().type('E2E Edited description for testing');
        cy.task('log', 'Title and description edited');
        cy.get('[data-cy="modal-action-button"]').click(); // Next from description

        // Edit ingredients
        cy.get('[data-cy="recipe-ingredient-0"]').clear().type('E2E Edited ingredient 1');
        cy.task('log', 'Ingredients edited');
        cy.get('[data-cy="modal-action-button"]').click(); // Next from ingredients

        // Skip methods step
        cy.get('[data-cy="modal-action-button"]').click(); // Next from methods

        // Edit steps
        cy.get('[data-cy="recipe-step-0"]').clear().type('E2E Edited step 1');
        cy.task('log', 'Steps edited');
        cy.get('[data-cy="modal-action-button"]').click(); // Next from steps

        // Skip related content step
        cy.get('[data-cy="modal-action-button"]').click(); // Next from related content

        // Update the recipe (final step - images)
        cy.get('[data-cy="modal-action-button"]').click(); // Update button
        cy.task('log', 'Recipe updated');
        cy.wait(5000);

        // Verify the recipe was updated
        cy.scrollTo('top');
        cy.get('.text-2xl').should('contain', 'E2E Edited Recipe Title');
        cy.task('log', 'Recipe title updated successfully');

        // Test 7: Recipe deletion
        cy.log('=== Testing Recipe Deletion ===');
        cy.get('[data-cy="delete-recipe"]').click();
        cy.task('log', 'Delete button clicked');
        cy.get('.text-start > .mt-2').then(($el) => {
            cy.get('[data-cy="delete-confirmation-text"]').type($el.text().slice(1, -1));
        });
        cy.task('log', 'Confirm Text filled');
        cy.get('[data-cy="modal-action-button"]').click();
        cy.task('log', 'Recipe deleted');
        cy.get('[class^="go"]').should('be.visible');
        cy.wait(3000);

        // Test 8: User logout
        cy.log('=== Testing User Logout ===');
        cy.get('[data-cy="user-menu"]').click();
        cy.get('[data-cy="user-menu-logout"]').click();
        cy.get('[data-cy="user-menu"]').click();
        cy.get('[data-cy="user-menu-logout"]').should('not.exist');
        cy.get('[data-cy="user-menu-login"]').should('be.visible');

        cy.task('log', '=== All E2E tests completed successfully ===');
    });
});
