describe('Quests E2E', () => {
    beforeEach(() => {
        cy.login();
        cy.visit('/');
        cy.ensureEnglish();
    });

    it('complete quest lifecycle - create, view, edit, and delete', () => {
        const questTitle = 'Test Quest';
        const questDescription =
            'Looking for a delicious chocolate cake recipe';

        // STEP 1: Navigate to quests page
        cy.task('log', '=== STEP 1: Navigating to quests page ===');
        cy.visit('/quests');
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
        cy.wait(1000);

        // STEP 3: Verify quest appears in the list
        cy.task('log', '=== STEP 3: Verifying quest in list ===');
        cy.get('[data-cy="quest-card-title"]', { timeout: 10000 })
            .contains(questTitle)
            .should('be.visible');
        cy.get('[data-cy="quest-card-description"]')
            .contains(questDescription)
            .should('be.visible');
        cy.get('[data-cy="quest-card-status"]')
            .contains('Open')
            .should('be.visible');
        cy.task('log', '✓ Quest appears in list with correct details');

        // STEP 4: Navigate to quest detail page
        cy.task('log', '=== STEP 4: Navigating to quest detail ===');
        cy.get('[data-cy="quest-card-title"]')
            .contains(questTitle)
            .should('be.visible')
            .click({ force: true });
        cy.task('log', 'Clicked on quest to view details');

        // Verify quest details on detail page
        cy.url().should('include', '/quests/');
        cy.get('[data-cy="quest-title-display"]').should('contain', questTitle);
        cy.get('[data-cy="quest-description-display"]').should(
            'contain',
            questDescription
        );
        cy.get('[data-cy="quest-status-display"]')
            .contains('Open')
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
        cy.get('[data-cy="quest-description"]').clear().type(editedDescription);
        cy.get('[data-cy="quest-status"]').select('in_progress');
        cy.task('log', 'Quest form updated');

        // Submit the update
        cy.get('[data-cy="modal-action-button"]').click();
        cy.task('log', 'Quest updated');
        cy.wait(1000);

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
            .contains('In Progress')
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
        cy.wait(1000);
        cy.task('log', '✅ Quest lifecycle test completed');

        // Verify quest is not in the list anymore
        cy.get('body').then(($body) => {
            if ($body.find('[data-cy="quest-card-title"]').length > 0) {
                cy.get('[data-cy="quest-card-title"]')
                    .contains(editedTitle)
                    .should('not.exist');
            }
        });
        cy.task('log', '✓ Quest removed from list');
    });
});
