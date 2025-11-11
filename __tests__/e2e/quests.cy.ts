describe('Quests E2E', () => {
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
            .then(($button) => {
                // Get the button text to check current language
                const buttonText = $button.text();
                cy.task('log', `Current language: ${buttonText}`);

                if (!buttonText.includes('English')) {
                    // Click the dropdown button to open options
                    cy.wrap($button).click();

                    // Select English from the dropdown
                    cy.contains('English').click();

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

    it('complete quest lifecycle - create, view, edit, and delete', () => {
        const questTitle = 'Test Quest';
        const questDescription = 'Looking for a delicious chocolate cake recipe';

        // STEP 1: Navigate to quests page
        cy.task('log', '=== STEP 1: Navigating to quests page ===');
        cy.visit('http://localhost:3000/quests');
        cy.task('log', 'Navigated to quests page');

        // STEP 2: Create a quest
        cy.task('log', '=== STEP 2: Creating quest ===');
        cy.get('[data-cy="request-recipe-button"]').click();
        cy.task('log', 'Request Recipe button clicked');

        // Fill in quest form
        cy.get('[data-cy="quest-title"]').type(questTitle);
        cy.get('[data-cy="quest-description"]').type(questDescription);
        cy.task('log', 'Quest form filled');

        // Submit the quest
        cy.get('[data-cy="modal-action-button"]').click();
        cy.task('log', 'Quest created');
        cy.wait(2000);

        // STEP 3: Verify quest appears in the list
        cy.task('log', '=== STEP 3: Verifying quest in list ===');
        cy.get('[data-cy="quest-card-title"]')
            .contains(questTitle)
            .should('be.visible');
        cy.get('[data-cy="quest-card-description"]')
            .contains(questDescription)
            .should('be.visible');
        cy.get('[data-cy="quest-card-status"]')
            .contains('open')
            .should('be.visible');
        cy.task('log', '✓ Quest appears in list with correct details');

        // STEP 4: Navigate to quest detail page
        cy.task('log', '=== STEP 4: Navigating to quest detail ===');
        cy.get('[data-cy="quest-card-title"]')
            .contains(questTitle)
            .should('be.visible')
            .click();
        cy.task('log', 'Clicked on quest to view details');

        // Verify quest details on detail page
        cy.url().should('include', '/quests/');
        cy.get('[data-cy="quest-title-display"]').should(
            'contain',
            questTitle
        );
        cy.get('[data-cy="quest-description-display"]').should(
            'contain',
            questDescription
        );
        cy.get('[data-cy="quest-status-display"]')
            .contains('open')
            .should('be.visible');
        cy.task('log', '✓ Quest detail page displays correct information');

        // STEP 5: Edit the quest
        cy.task('log', '=== STEP 5: Editing quest ===');
        cy.get('[data-cy="edit-quest"]').click();
        cy.task('log', 'Edit button clicked');

        // Update quest details
        const editedTitle = 'Updated Quest Title';
        const editedDescription = 'Looking for a delicious vanilla cake recipe';

        cy.get('[data-cy="quest-title"]').clear().type(editedTitle);
        cy.get('[data-cy="quest-description"]')
            .clear()
            .type(editedDescription);
        cy.get('[data-cy="quest-status"]').select('in_progress');
        cy.task('log', 'Quest form updated');

        // Submit the update
        cy.get('[data-cy="modal-action-button"]').click();
        cy.task('log', 'Quest updated');
        cy.wait(2000);

        // Verify updated quest details
        cy.task('log', 'Verifying quest update...');
        cy.get('[data-cy="quest-title-display"]').should(
            'contain',
            editedTitle
        );
        cy.get('[data-cy="quest-description-display"]').should(
            'contain',
            editedDescription
        );
        cy.get('[data-cy="quest-status-display"]')
            .contains('in_progress')
            .should('be.visible');
        cy.task('log', '✓ Quest updated successfully');
        cy.task('log', '🧪 Quest edit completed');

        // STEP 6: Delete the quest
        cy.task('log', '=== STEP 6: Deleting quest ===');
        cy.get('[data-cy="delete-quest"]').click();
        cy.task('log', 'Delete button clicked');

        // Confirm deletion
        cy.get('[data-cy="modal-action-button"]').click();
        cy.task('log', '🧪 Quest deleted successfully');

        // Verify we're back to quests page
        cy.url().should('include', '/quests');
        cy.task('log', '✅ Quest lifecycle test completed');

        // Verify quest is not in the list anymore
        cy.get('[data-cy="quest-card-title"]')
            .contains(editedTitle)
            .should('not.exist');
        cy.task('log', '✓ Quest removed from list');
    });
});
