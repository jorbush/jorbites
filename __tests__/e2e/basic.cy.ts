describe('Recipes E2E', () => {
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

        // Set language to English to ensure consistent test results
        cy.task('log', 'Setting language to English...');
        cy.get('[data-cy="user-menu"]').click();

        // Click on settings in the user menu using the new data-cy attribute
        cy.get('[data-cy="user-menu-panel"]').should('be.visible');
        cy.get('[data-cy="user-menu-settings"]').click();

        // Settings modal should be open, wait for it to fully load using data-cy selectors
        cy.get('[data-cy="settings-modal-content"]', { timeout: 10000 }).should(
            'be.visible'
        );

        // Look for the language selector using the new data-cy attribute
        cy.get('[data-cy="language-dropdown"]', { timeout: 5000 })
            .should('be.visible')
            .then(($select) => {
                // Check if we're not already on English
                const currentLang = $select.val();
                cy.task('log', `Current language: ${currentLang}`);

                if (currentLang !== 'en') {
                    cy.wrap($select).select('en');

                    // Save settings to persist the language change
                    cy.get('[data-cy="modal-action-button"]')
                        .should('be.visible')
                        .click();

                    // Wait for modal to close and language change to take effect
                    cy.get('[data-cy="settings-modal-content"]').should(
                        'not.exist'
                    );
                    cy.task('log', 'Language changed to English and saved');
                } else {
                    // Already in English, just close the modal
                    cy.get('[data-testid="close-modal-button"]')
                        .should('be.visible')
                        .click();

                    // Wait for modal to close
                    cy.get('[data-cy="settings-modal-content"]').should(
                        'not.exist'
                    );
                    cy.task('log', 'Language already set to English');
                }
            });
    });

    it('complete recipe lifecycle - create, like, unlike, comment, delete comment, edit, and delete', () => {
        const recipeName = 'Test recipe';

        // STEP 1: Create a recipe
        cy.task('log', '=== STEP 1: Creating recipe ===');
        cy.get('[data-cy="post-recipe"]').click();
        // Fill category step
        cy.get('[data-cy="category-box-Fruits"]').click();
        cy.task('log', 'Category step filled');
        cy.get('[data-cy="modal-action-button"]').click();
        // Fill description step
        cy.get('[data-cy="recipe-title"]').type(recipeName);
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
        cy.wait(2000);

        // Navigate to the newly created recipe
        cy.get('[data-cy="recipe-card-title"]')
            .contains(recipeName)
            .should('be.visible')
            .click();
        cy.task('log', '🧪 Recipe creation completed');

        // Verify recipe creation details
        cy.task('log', 'Verifying recipe creation details...');
        cy.url().should('include', '/recipes/');

        // Check recipe title
        cy.get('[data-cy="recipe-title-display"]').should(
            'contain',
            recipeName
        );
        cy.task('log', '✓ Recipe title verified');

        // Check recipe description
        cy.get('[data-cy="recipe-description-display"]').should(
            'contain',
            'Test description'
        );
        cy.task('log', '✓ Recipe description verified');

        // Check ingredients
        cy.get('[data-cy="ingredients-section"]').within(() => {
            cy.get('li').should(($els) => {
                expect($els.length).to.be.at.least(2);
            });
            cy.get('li').eq(0).should('contain', 'Test ingredient');
            cy.get('li').eq(1).should('contain', 'Test ingredient');
        });
        cy.task('log', '✓ Recipe ingredients verified');

        // Check cooking method
        cy.get('[data-cy="cooking-methods"]').should('contain', 'Oven');
        cy.task('log', '✓ Cooking method verified');

        // Check recipe steps
        cy.get('[data-cy="steps-section"]').within(() => {
            cy.get('[data-cy^="step-"]').should(($els) => {
                expect($els.length).to.be.at.least(2);
            });
            cy.get('[data-cy="step-0"]').should('contain', 'Test step');
            cy.get('[data-cy="step-1"]').should('contain', 'Test step');
        });
        cy.task('log', '✓ Recipe steps verified');

        cy.task('log', '🎉 All recipe creation details verified successfully');

        // STEP 2: Like the recipe
        cy.task('log', '=== STEP 2: Liking recipe ===');
        cy.get('[data-cy="heart-button"]').click();
        cy.task('log', 'Recipe liked button clicked');

        // Verify the like was successful
        cy.get('[data-testid="heart-button"]').should(
            'have.class',
            'fill-green-450'
        );
        cy.get('[data-cy="recipe-num-likes"]').should('have.text', '1');
        cy.task('log', '🧪 Recipe liked successfully');

        // STEP 3: Unlike the recipe
        cy.task('log', '=== STEP 3: Unliking recipe ===');
        cy.wait(5000);
        cy.get('[data-cy="heart-button"]').click();
        cy.task('log', 'Recipe unliked button clicked');
        cy.get('[data-testid="heart-button"]').should(
            'not.have.class',
            'fill-green-450'
        );
        cy.get('[data-cy="recipe-num-likes"]').should('have.text', '0');
        cy.task('log', '🧪 Recipe unliked successfully');

        // STEP 4: Comment on the recipe
        cy.task('log', '=== STEP 4: Adding comment ===');
        cy.scrollTo('bottom');
        cy.get('[data-cy="comment-input"]').type('Test comment');
        cy.task('log', 'Comment input filled');
        cy.get('[data-cy="submit-comment"]').click();

        // Verify comment was added
        cy.get('[data-cy="comment-text"]').should('have.text', 'Test comment');
        cy.task('log', '🧪 Recipe commented successfully');

        // STEP 5: Delete the comment
        cy.task('log', '=== STEP 5: Deleting comment ===');
        cy.get('[data-testid="MdDelete"]').click();
        cy.get('[data-cy="modal-action-button"]').click();

        // Verify comment was deleted
        cy.get('[data-cy="comment-text"]').should('not.exist');
        cy.task('log', '🧪 Comment deleted successfully');

        // STEP 6: Edit the recipe
        cy.task('log', '=== STEP 6: Editing recipe ===');
        cy.get('body').then(($body) => {
            if ($body.find('.fixed.inset-0.z-50').length > 0) {
                cy.get('[data-testid="close-modal-button"]').click({
                    force: true,
                });
                cy.wait(1000);
            }
        });

        // Ensure we're on the recipe page
        cy.url().then((url) => {
            if (!url.includes('/recipes/')) {
                // Navigate to recipe if not already there
                cy.get('[data-cy="recipe-card-title"]')
                    .contains(recipeName)
                    .should('be.visible')
                    .scrollIntoView()
                    .click({ force: true });
            }
        });

        // Wait for the recipe page to load fully
        cy.url().should('include', '/recipes/');

        // Now edit the recipe
        cy.get('[data-cy="edit-recipe"]').click();
        cy.task('log', 'Edit button clicked');
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
        cy.wait(2000);

        // Wait for update to complete and return to recipe page
        cy.url().should('include', '/recipes/');
        cy.scrollTo('top');
        // Verify the recipe was updated
        cy.task('log', 'Verifying recipe update details...');

        // Check updated recipe title
        cy.get('[data-cy="recipe-title-display"]').should(
            'contain',
            'Edited Recipe Title'
        );
        cy.task('log', '✓ Updated recipe title verified');

        // Check updated recipe description
        cy.get('[data-cy="recipe-description-display"]').should(
            'contain',
            'Edited description'
        );
        cy.task('log', '✓ Updated recipe description verified');

        // Check updated ingredients
        cy.get('[data-cy="ingredients-section"]').within(() => {
            cy.get('li').should(($els) => {
                expect($els.length).to.be.at.least(2);
            });
            cy.get('li').eq(0).should('contain', 'Edited ingredient');
            // Second ingredient should still be the original one
            cy.get('li').eq(1).should('contain', 'Test ingredient');
        });
        cy.task('log', '✓ Updated recipe ingredients verified');

        // Check cooking method (should remain the same)
        cy.get('[data-cy="cooking-methods"]').should('contain', 'Oven');
        cy.task('log', '✓ Cooking method maintained');

        // Check updated recipe steps
        cy.get('[data-cy="steps-section"]').within(() => {
            cy.get('[data-cy^="step-"]').should(($els) => {
                expect($els.length).to.be.at.least(2);
            });
            cy.get('[data-cy="step-0"]').should('contain', 'Edited step');
            // Second step should still be the original one
            cy.get('[data-cy="step-1"]').should('contain', 'Test step');
        });
        cy.task('log', '✓ Updated recipe steps verified');

        cy.task('log', '🎉 All recipe update details verified successfully');
        cy.task('log', '🧪 Recipe edit completed');

        // STEP 7: Delete the recipe
        cy.task('log', '=== STEP 7: Deleting recipe ===');
        cy.scrollTo('bottom');
        cy.get('[data-cy="delete-recipe"]').click();
        cy.task('log', 'Delete button clicked');
        cy.get('.text-start > .mt-2').then(($el) => {
            cy.get('[data-cy="delete-confirmation-text"]').type(
                $el.text().slice(1, -1)
            );
        });
        cy.task('log', 'Confirm Text filled');
        cy.get('[data-cy="modal-action-button"]').click();
        cy.task('log', '🧪 Recipe deleted successfully');
        cy.task('log', '✅ Recipe lifecycle test completed');

        // Verify we're back to homepage
        cy.url().should('eq', 'http://localhost:3000/');
    });
});
