describe('Workshops E2E', () => {
    beforeEach(() => {
        cy.login();
        cy.visit('/workshops');
        cy.ensureEnglish();
    });

    it('complete workshop lifecycle - create, update, and delete', () => {
        const workshopTitle = 'Test Workshop';
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
        const formattedDate = futureDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm

        // STEP 1: Create a workshop
        cy.task('log', '=== STEP 1: Creating workshop ===');
        cy.get('[data-cy="create-workshop"]').click();

        // Fill info step
        cy.get('[data-cy="workshop-title"]').type(workshopTitle);
        cy.get('[data-cy="workshop-description"]').type(
            'Test workshop description'
        );
        cy.get('[data-cy="workshop-date"]').type(formattedDate);
        cy.get('[data-cy="workshop-location"]').type('Test Location');
        cy.task('log', 'Info step filled');
        cy.get('[data-cy="modal-action-button"]').click();

        // Fill requirements step - add ingredients and previous steps
        cy.get('[data-cy="ingredients-section"]').click();
        cy.get('[data-cy="add-ingredient-button"]').click();
        cy.get('[data-cy="workshop-ingredient-0"]').type('Test ingredient 1');
        cy.get('[data-cy="add-ingredient-button"]').click();
        cy.get('[data-cy="workshop-ingredient-1"]').type('Test ingredient 2');

        cy.get('[data-cy="previous-steps-section"]').click();
        cy.get('[data-cy="add-previous-step-button"]').click();
        cy.get('[data-cy="workshop-previous-step-0"]').type(
            'Test previous step 1'
        );
        cy.get('[data-cy="add-previous-step-button"]').click();
        cy.get('[data-cy="workshop-previous-step-1"]').type(
            'Test previous step 2'
        );
        cy.task('log', 'Requirements step filled');
        cy.get('[data-cy="modal-action-button"]').click();

        // Skip privacy step
        cy.task('log', 'Privacy step skipped');
        cy.get('[data-cy="modal-action-button"]').click();

        // Skip image step and create the workshop
        cy.task('log', 'Image step skipped');
        cy.get('[data-cy="modal-action-button"]').click();

        // Check if the workshop was created
        cy.task('log', 'Workshop created');
        cy.wait(1000);

        // Verify we're on the workshop detail page
        cy.url().should('include', '/workshops/');
        cy.task('log', '🧪 Workshop creation completed');

        // Verify workshop creation details
        cy.task('log', 'Verifying workshop creation details...');

        // Check workshop title
        cy.get('[data-cy="workshop-title-display"]').should(
            'contain',
            workshopTitle
        );
        cy.task('log', '✓ Workshop title verified');

        // Check workshop description
        cy.get('[data-cy="workshop-description-display"]').should(
            'contain',
            'Test workshop description'
        );
        cy.task('log', '✓ Workshop description verified');

        // Check workshop location
        cy.get('[data-cy="workshop-location-display"]').should(
            'contain',
            'Test Location'
        );
        cy.task('log', '✓ Workshop location verified');

        // Check ingredients
        cy.get('[data-cy="workshop-ingredients-section"]').within(() => {
            cy.contains('Test ingredient 1').should('exist');
            cy.contains('Test ingredient 2').should('exist');
        });
        cy.task('log', '✓ Workshop ingredients verified');

        // Check previous steps
        cy.get('[data-cy="workshop-previous-steps-section"]').within(() => {
            cy.get('[data-cy="workshop-previous-step-display-0"]').should(
                'contain',
                'Test previous step 1'
            );
            cy.get('[data-cy="workshop-previous-step-display-1"]').should(
                'contain',
                'Test previous step 2'
            );
        });
        cy.task('log', '✓ Workshop previous steps verified');

        cy.task(
            'log',
            '🎉 All workshop creation details verified successfully'
        );

        // STEP 2: Edit the workshop
        cy.task('log', '=== STEP 2: Editing workshop ===');
        cy.scrollTo('top');
        cy.get('[data-cy="edit-workshop"]').click();
        cy.task('log', 'Edit button clicked');

        // Navigate to info step and edit
        cy.get('[data-cy="workshop-title"]')
            .clear()
            .type('Edited Workshop Title');
        cy.get('[data-cy="workshop-description"]')
            .clear()
            .type('Edited workshop description');
        cy.task('log', 'Title and description edited');
        cy.get('[data-cy="modal-action-button"]').click();

        // Edit ingredients
        cy.get('[data-cy="ingredients-section"]').click();
        cy.get('[data-cy="workshop-ingredient-0"]')
            .clear()
            .type('Edited ingredient 1');
        cy.task('log', 'Ingredients edited');
        cy.get('[data-cy="modal-action-button"]').click();

        // Skip privacy step
        cy.get('[data-cy="modal-action-button"]').click();

        // Update the workshop (final step - images)
        cy.get('[data-cy="modal-action-button"]').click();
        cy.task('log', 'Workshop updated');
        cy.wait(1000);

        // Wait for update to complete and return to workshop page
        cy.url().should('include', '/workshops/');
        cy.scrollTo('top');

        // Verify the workshop was updated
        cy.task('log', 'Verifying workshop update details...');

        // Check updated workshop title
        cy.get('[data-cy="workshop-title-display"]').should(
            'contain',
            'Edited Workshop Title'
        );
        cy.task('log', '✓ Updated workshop title verified');

        // Check updated workshop description
        cy.get('[data-cy="workshop-description-display"]').should(
            'contain',
            'Edited workshop description'
        );
        cy.task('log', '✓ Updated workshop description verified');

        // Check updated ingredients
        cy.get('[data-cy="workshop-ingredients-section"]').within(() => {
            cy.contains('Edited ingredient 1').should('exist');
            // Second ingredient should still be the original one
            cy.contains('Test ingredient 2').should('exist');
        });
        cy.task('log', '✓ Updated workshop ingredients verified');

        // Check previous steps (should remain the same)
        cy.get('[data-cy="workshop-previous-steps-section"]').within(() => {
            cy.get('[data-cy="workshop-previous-step-display-0"]').should(
                'contain',
                'Test previous step 1'
            );
            cy.get('[data-cy="workshop-previous-step-display-1"]').should(
                'contain',
                'Test previous step 2'
            );
        });
        cy.task('log', '✓ Workshop previous steps maintained');

        cy.task('log', '🎉 All workshop update details verified successfully');
        cy.task('log', '🧪 Workshop edit completed');

        // STEP 3: Delete the workshop
        cy.task('log', '=== STEP 3: Deleting workshop ===');
        cy.scrollTo('bottom');
        cy.get('[data-cy="delete-workshop"]').click();
        cy.task('log', 'Delete button clicked');
        cy.get('.text-start > .mt-2').then(($el) => {
            cy.get('[data-cy="delete-confirmation-text"]').type(
                $el.text().slice(1, -1)
            );
        });
        cy.task('log', 'Confirm Text filled');
        cy.get('[data-cy="modal-action-button"]').click();
        cy.task('log', '🧪 Workshop deleted successfully');
        cy.task('log', '✅ Workshop lifecycle test completed');

        // Verify we're back to workshops page
        cy.location('pathname', { timeout: 10000 }).should('eq', '/workshops');
    });
});
