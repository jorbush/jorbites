describe('Drafts Management & Multi-Draft E2E', () => {
    const cleanupDrafts = () => {
        cy.request({
            method: 'GET',
            url: '/api/draft/active',
            failOnStatusCode: false,
        }).then((res) => {
            if (Array.isArray(res.body)) {
                res.body.forEach((d: { draftId: string }) => {
                    if (d?.draftId) {
                        cy.request({
                            method: 'DELETE',
                            url: `/api/draft?draftId=${encodeURIComponent(d.draftId)}`,
                            failOnStatusCode: false,
                        });
                    }
                });
            }
        });
        cy.request({
            method: 'DELETE',
            url: '/api/draft',
            failOnStatusCode: false,
        });
    };

    beforeEach(() => {
        cy.login();
        cy.visit('/');
        cleanupDrafts();
        cy.ensureEnglish();
    });

    afterEach(() => {
        cleanupDrafts();
    });

    it('opens DraftsModal from UserMenu and displays empty state when no drafts exist', () => {
        cy.get('[data-cy="user-menu"]').click();
        cy.get('[data-cy="user-menu-my-drafts"]').should('be.visible').click();

        cy.get('[data-testid="drafts-modal"]').should('be.visible');
        cy.get('[data-testid="drafts-modal-empty-state"]').should('be.visible');
        cy.get('[data-testid="drafts-modal-empty-create-btn"]').should(
            'be.visible'
        );
    });

    it('creates a new draft, auto-loads it on re-open, accesses DraftsModal from inside RecipeModal, duplicates, and deletes', () => {
        // Step 1: Open RecipeModal via Post a recipe
        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');

        // Select a category
        cy.get('[data-cy="category-box-Desserts"]').click();
        cy.get('[data-cy="modal-action-button"]').click();

        // Fill Title
        cy.get('[data-cy="recipe-title"]').type('Berry Pavlova Draft');
        cy.get('[data-cy="recipe-description"]').type(
            'Crisp meringue with fresh berries'
        );

        // Save Draft
        cy.intercept('POST', '/api/draft').as('saveDraft');
        cy.get('[data-testid="load-draft-button"]').click();
        cy.wait('@saveDraft');

        // Close RecipeModal
        cy.get('[data-testid="close-modal-button"]').click();

        // Step 2: Click Post a recipe again -> should auto-load Berry Pavlova Draft
        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');
        cy.get('[data-testid="drafts-indicator-dot"]').should('be.visible');

        // Step 3: Open DraftsModal via the in-modal top action button
        cy.get('[data-testid="open-drafts-modal-button"]').click();

        cy.get('[data-testid="drafts-modal"]').should('be.visible');
        cy.get('[data-testid="draft-card"]').should('have.length', 1);
        cy.get('[data-testid="draft-card-title"]').should(
            'contain.text',
            'Berry Pavlova Draft'
        );
        cy.get('[data-testid="draft-progress-bar"]').should('be.visible');
        cy.get('[data-testid="draft-ttl-badge"]').should('be.visible');
        cy.get('[data-testid="draft-card-share"]').should('be.visible');

        // Step 4: Duplicate the draft
        cy.intercept('POST', '/api/draft').as('duplicateDraft');
        cy.get('[data-testid="draft-card-duplicate"]').first().click();
        cy.wait('@duplicateDraft');

        // Should now have 2 draft cards: both the original and the new copy
        cy.get('[data-testid="draft-card"]').should('have.length', 2);
        cy.contains(
            '[data-testid="draft-card-title"]',
            'Berry Pavlova Draft (Copy)'
        ).should('be.visible');
        cy.contains(
            '[data-testid="draft-card-title"]',
            'Berry Pavlova Draft'
        ).should('be.visible');

        // Step 5: Delete the duplicate copy (the first/newest card)
        cy.intercept('DELETE', '/api/draft*').as('deleteDraft');
        cy.get('[data-testid="draft-card-delete"]').first().click();
        cy.get('[data-testid="draft-delete-confirmation"]').should(
            'be.visible'
        );
        cy.get('[data-testid="draft-delete-confirm-btn"]').click();
        cy.wait('@deleteDraft');

        // Should now have 1 draft card remaining (the original)
        cy.get('[data-testid="draft-card"]').should('have.length', 1);
        cy.get('[data-testid="draft-card-title"]').should(
            'contain.text',
            'Berry Pavlova Draft'
        );

        // Step 6: Click card to open in RecipeModal
        cy.get('[data-testid="draft-card"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');
    });
});
