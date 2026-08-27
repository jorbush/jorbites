describe('Drafts Navigation Entry Points E2E', () => {
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

    it('clicking Post a recipe with 0 drafts opens RecipeModal without drafts indicator dot', () => {
        cy.get('[data-cy="post-recipe"]').should('be.visible').click();

        // Opens RecipeModal directly
        cy.get('[data-testid="modal-title"]').should('be.visible');
        cy.get('[data-cy^="category-box-"]').first().should('be.visible');

        // Top actions should have drafts folder button without indicator dot
        cy.get('[data-testid="open-drafts-modal-button"]').should('be.visible');
        cy.get('[data-testid="drafts-indicator-dot"]').should('not.exist');
    });

    it('clicking Post a recipe with existing draft auto-loads it and displays drafts indicator dot', () => {
        // Create a draft first via API
        cy.request({
            method: 'POST',
            url: '/api/draft',
            body: {
                title: 'Auto Loaded Draft Recipe',
                categories: ['quick'],
                updatedAt: new Date().toISOString(),
            },
        });

        // Click navbar "Post a recipe" button
        cy.get('[data-cy="post-recipe"]').should('be.visible').click();

        // Should open RecipeModal and show indicator dot on the drafts folder icon
        cy.get('[data-testid="modal-title"]').should('be.visible');
        cy.get('[data-testid="open-drafts-modal-button"]').should('be.visible');
        cy.get('[data-testid="drafts-indicator-dot"]').should('be.visible');

        // Clicking the drafts folder button in RecipeModal opens DraftsModal
        cy.get('[data-testid="open-drafts-modal-button"]').click();
        cy.get('[data-testid="drafts-modal"]').should('be.visible');
        cy.get('[data-testid="draft-card"]').should('have.length', 1);
        cy.get('[data-testid="draft-card-title"]').should(
            'contain.text',
            'Auto Loaded Draft Recipe'
        );
    });

    it('My Drafts menu item in UserMenu directly opens DraftsModal', () => {
        cy.get('[data-cy="user-menu"]').click();
        cy.get('[data-cy="user-menu-my-drafts"]').should('be.visible').click();

        cy.get('[data-testid="drafts-modal"]').should('be.visible');
    });
});
