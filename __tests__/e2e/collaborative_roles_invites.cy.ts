describe('Collaborative Drafts Roles & Invites E2E', () => {
    let createdRecipeIds: string[] = [];

    const cleanupResources = () => {
        if (createdRecipeIds.length > 0) {
            createdRecipeIds.forEach((recipeId) => {
                cy.request({
                    method: 'DELETE',
                    url: `/api/recipe/${recipeId}`,
                    failOnStatusCode: false,
                });
            });
            createdRecipeIds = [];
        }

        // Clean up drafts
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
        cleanupResources();
        cy.visit('/');
        cy.ensureEnglish();
    });

    afterEach(() => {
        cleanupResources();
    });

    after(() => {
        cleanupResources();
    });

    it('opens DraftInviteModal from DraftCard and copies invite link', () => {
        // Create a shared draft via API
        cy.request({
            method: 'POST',
            url: '/api/draft/invite',
            body: {
                title: 'E2E Invite Test Recipe',
                description: 'Testing in-app invite modal',
                categories: ['Dessert'],
            },
        }).then((res) => {
            expect(res.status).to.eq(200);
            const draftId = res.body.draftId;
            expect(draftId).to.exist;

            // Open My Drafts modal
            cy.get('[data-cy="user-menu"]').click();
            cy.get('[data-cy="user-menu-my-drafts"]')
                .should('be.visible')
                .click();

            // Find the draft card and click the manage collabs / invite icon
            cy.get('[data-testid="drafts-modal"]').should('be.visible');
            cy.get('[data-testid="draft-card-manage-collabs"]').first().click();

            // DraftInviteModal should open
            cy.get('[data-testid="draft-invite-modal"]').should('be.visible');
            cy.get('[data-testid="invite-link-input"]')
                .should('be.visible')
                .invoke('val')
                .should('include', draftId);

            // Copy invite link button
            cy.get('[data-testid="copy-invite-link-btn"]')
                .should('be.visible')
                .click();
            cy.get('[data-testid="role-badge-owner"]').should('be.visible');

            // Close modal
            cy.get('[data-testid="close-modal-button"]').last().click();
        });
    });

    it('allows owner to regenerate invite link with confirmation', () => {
        cy.request({
            method: 'POST',
            url: '/api/draft/invite',
            body: {
                title: 'E2E Regenerate Link Recipe',
                categories: ['Dinner'],
            },
        }).then((res) => {
            const initialToken = res.body.inviteToken;
            expect(initialToken).to.exist;

            // Open My Drafts and open DraftInviteModal
            cy.get('[data-cy="user-menu"]').click();
            cy.get('[data-cy="user-menu-my-drafts"]')
                .should('be.visible')
                .click();
            cy.get('[data-testid="draft-card-manage-collabs"]').first().click();

            cy.get('[data-testid="draft-invite-modal"]').should('be.visible');
            cy.intercept('POST', '/api/draft/invite').as('regenerateToken');
            cy.get('[data-testid="regenerate-invite-link-btn"]')
                .should('be.visible')
                .click();

            // Confirmation box appears
            cy.get('[data-testid="regenerate-confirm-box"]').should(
                'be.visible'
            );
            cy.get('[data-testid="regenerate-confirm-btn"]').click();
            cy.wait('@regenerateToken');

            // Toast confirms regeneration and input updates
            cy.get('[data-testid="invite-link-input"]', { timeout: 10000 })
                .invoke('val')
                .should((val) => {
                    expect(val).not.to.include(initialToken);
                });
        });
    });

    it('allows owner to manage co-cook role between editor and viewer', () => {
        // Create draft with invite token
        cy.request({
            method: 'POST',
            url: '/api/draft/invite',
            body: {
                title: 'E2E Role Management Recipe',
                categories: ['Lunch'],
            },
        }).then((res) => {
            const draftId = res.body.draftId;

            // Simulate co-cook joining via /api/draft/join
            // We patch coCooksIds to simulate an existing collaborator
            cy.request({
                method: 'POST',
                url: '/api/draft',
                body: {
                    draftId,
                    title: 'E2E Role Management Recipe',
                    coCooksIds: ['mock-cocook-id-1'],
                    coCookRoles: {
                        'mock-cocook-id-1': 'editor',
                    },
                },
            }).then(() => {
                // Open modal
                cy.get('[data-cy="user-menu"]').click();
                cy.get('[data-cy="user-menu-my-drafts"]')
                    .should('be.visible')
                    .click();
                cy.get('[data-testid="draft-card-manage-collabs"]')
                    .first()
                    .click();

                cy.get('[data-testid="draft-invite-modal"]').should(
                    'be.visible'
                );
                cy.get('[data-testid="collaborators-list"]').should(
                    'be.visible'
                );

                cy.intercept('PATCH', '/api/draft/role').as('updateRole');

                // Role selector for co-cook
                cy.get('[data-testid="role-select-mock-cocook-id-1"]')
                    .should('be.visible')
                    .should('have.value', 'editor');

                // Toggle to viewer
                cy.get('[data-testid="role-select-mock-cocook-id-1"]').select(
                    'viewer'
                );
                cy.wait('@updateRole');

                // Verify PATCH called and select value updated
                cy.get('[data-testid="role-select-mock-cocook-id-1"]').should(
                    'have.value',
                    'viewer'
                );
            });
        });
    });

    it('allows owner to remove a co-cook collaborator', () => {
        cy.request({
            method: 'POST',
            url: '/api/draft/invite',
            body: {
                title: 'E2E Remove Collaborator Recipe',
                categories: ['Dessert'],
            },
        }).then((res) => {
            const draftId = res.body.draftId;

            cy.request({
                method: 'POST',
                url: '/api/draft',
                body: {
                    draftId,
                    title: 'E2E Remove Collaborator Recipe',
                    coCooksIds: ['mock-cocook-id-to-remove'],
                },
            }).then(() => {
                cy.get('[data-cy="user-menu"]').click();
                cy.get('[data-cy="user-menu-my-drafts"]')
                    .should('be.visible')
                    .click();
                cy.get('[data-testid="draft-card-manage-collabs"]')
                    .first()
                    .click();

                cy.get('[data-testid="draft-invite-modal"]').should(
                    'be.visible'
                );
                cy.get(
                    '[data-testid="collaborator-item-mock-cocook-id-to-remove"]'
                ).should('be.visible');

                cy.intercept('DELETE', '/api/draft/collaborator*').as(
                    'removeCollab'
                );

                // Click remove button
                cy.get(
                    '[data-testid="remove-collaborator-mock-cocook-id-to-remove"]'
                ).click();
                cy.wait('@removeCollab');

                // Item is removed from the collaborator list
                cy.get(
                    '[data-testid="collaborator-item-mock-cocook-id-to-remove"]'
                ).should('not.exist');
            });
        });
    });

    it('opens DraftInviteModal from RelatedContentStep within RecipeModal', () => {
        cy.request({
            method: 'POST',
            url: '/api/draft/invite',
            body: {
                title: 'E2E In-Recipe Manage Test',
                categories: ['Breakfast'],
            },
        }).then((res) => {
            const draftId = res.body.draftId;

            // Open My Drafts and open the draft in RecipeModal
            cy.get('[data-cy="user-menu"]').click();
            cy.get('[data-cy="user-menu-my-drafts"]')
                .should('be.visible')
                .click();
            cy.get('[data-testid="draft-card-title"]').first().click();

            // RecipeModal opens
            cy.get('[data-testid="modal-title"]').should('be.visible');

            // Navigate through steps to Step 5 (Related Content)
            // Step 0 (Category) -> Step 1 (Description) -> Step 2 (Ingredients) -> Step 3 (Method) -> Step 4 (Steps) -> Step 5 (Related Content)
            cy.get('[data-cy="modal-action-button"]').click(); // Step 1 (Description)
            cy.get('[data-cy="modal-action-button"]').click(); // Step 2 (Ingredients)
            cy.get('[data-cy="modal-action-button"]').click(); // Step 3 (Method)
            cy.get('[data-cy="modal-action-button"]').click(); // Step 4 (Steps)
            cy.get('[data-cy="modal-action-button"]').click(); // Step 5 (Related Content)

            cy.get('[data-testid="related-content-tabs"]').should('be.visible');

            // Ensure Co-Cooks tab is selected (default)
            cy.get('[data-testid="tab-users"]').click();

            // Manage Co-Cooks & Invites button should be rendered
            cy.get('[data-testid="manage-co-cooks-btn"]')
                .should('be.visible')
                .click();

            // DraftInviteModal should open
            cy.get('[data-testid="draft-invite-modal"]').should('be.visible');
            cy.get('[data-testid="invite-link-input"]').should('be.visible');
        });
    });
});
