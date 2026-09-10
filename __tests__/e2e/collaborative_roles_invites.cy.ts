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

            // Find the specific draft card and click the manage collabs / invite icon
            cy.get('[data-testid="drafts-modal"]').should('be.visible');
            cy.contains('[data-testid="draft-card"]', 'E2E Invite Test Recipe')
                .find('[data-testid="draft-card-manage-collabs"]')
                .click();

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
            cy.get('[data-testid="draft-invite-modal"]')
                .parents('.fixed')
                .find('[data-testid="close-modal-button"]')
                .click();
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
            cy.contains(
                '[data-testid="draft-card"]',
                'E2E Regenerate Link Recipe'
            )
                .find('[data-testid="draft-card-manage-collabs"]')
                .click();

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

            // Close modal
            cy.get('[data-testid="draft-invite-modal"]')
                .parents('.fixed')
                .find('[data-testid="close-modal-button"]')
                .click();
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
                cy.contains(
                    '[data-testid="draft-card"]',
                    'E2E Role Management Recipe'
                )
                    .find('[data-testid="draft-card-manage-collabs"]')
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

                // Close modal
                cy.get('[data-testid="draft-invite-modal"]')
                    .parents('.fixed')
                    .find('[data-testid="close-modal-button"]')
                    .click();
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
                cy.contains(
                    '[data-testid="draft-card"]',
                    'E2E Remove Collaborator Recipe'
                )
                    .find('[data-testid="draft-card-manage-collabs"]')
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

                // Close modal
                cy.get('[data-testid="draft-invite-modal"]')
                    .parents('.fixed')
                    .find('[data-testid="close-modal-button"]')
                    .click();
            });
        });
    });

    it('allows owner to add collaborator directly via user search in DraftInviteModal', () => {
        cy.request({
            method: 'POST',
            url: '/api/draft/invite',
            body: {
                title: 'E2E Direct Add User Recipe',
                categories: ['Breakfast'],
            },
        }).then((res) => {
            const draftId = res.body.draftId;

            // Open My Drafts and open DraftInviteModal for this draft
            cy.get('[data-cy="user-menu"]').click();
            cy.get('[data-cy="user-menu-my-drafts"]')
                .should('be.visible')
                .click();
            cy.get('[data-testid="drafts-modal"]').should('be.visible');
            cy.contains(
                '[data-testid="draft-card"]',
                'E2E Direct Add User Recipe'
            )
                .find('[data-testid="draft-card-manage-collabs"]')
                .click();

            // DraftInviteModal should open
            cy.get('[data-testid="draft-invite-modal"]').should('be.visible');

            // Intercept user search and collaborator addition
            cy.intercept('GET', '/api/search?q=*&type=users').as('searchUsers');
            cy.intercept('POST', '/api/draft/collaborator').as('addCollab');

            // Search for an existing user
            cy.get('[data-cy="search-input"]').type('Chef');
            cy.wait('@searchUsers');

            // Select user from search dropdown
            cy.get('[data-cy="search-input"]')
                .parent()
                .parent()
                .find('button[type="button"]')
                .first()
                .click();

            cy.wait('@addCollab');

            // Toast appears
            cy.contains('Co-cook added').should('be.visible');

            // Modal can be closed with the action close button
            cy.get('[data-testid="draft-invite-modal"]')
                .parents('.fixed')
                .find('[data-cy="modal-action-button"]')
                .click();

            cy.get('[data-testid="draft-invite-modal"]').should('not.exist');
        });
    });

    it('verifies that a user added via search has access to the recipe and can edit', () => {
        const collabRecipeTitle = `Collab Edit Test ${Date.now().toString().slice(-4)}`;

        // 1. Owner creates a draft with initial content
        cy.request({
            method: 'POST',
            url: '/api/draft/invite',
            body: {
                title: collabRecipeTitle,
                description: 'Original description by owner',
                categories: ['Breakfast'],
                ingredients: ['Oats: 50g'],
                method: 'Boil',
                steps: ['Boil oats with water'],
                currentStep: 1,
            },
        }).then((res) => {
            const draftId = res.body.draftId;

            // 2. Owner opens My Drafts and opens DraftInviteModal
            cy.get('[data-cy="user-menu"]').click();
            cy.get('[data-cy="user-menu-my-drafts"]')
                .should('be.visible')
                .click();
            cy.get('[data-testid="drafts-modal"]').should('be.visible');
            cy.contains('[data-testid="draft-card"]', collabRecipeTitle)
                .find('[data-testid="draft-card-manage-collabs"]')
                .click();

            // 3. In DraftInviteModal, owner searches for Chef Maria and adds her
            cy.get('[data-testid="draft-invite-modal"]').should('be.visible');
            cy.intercept('GET', '/api/search?q=*&type=users').as('searchUsers');
            cy.intercept('POST', '/api/draft/collaborator').as('addCollab');

            cy.get('[data-cy="search-input"]').type('Chef Maria');
            cy.wait('@searchUsers');

            // Select Chef Maria from search results
            cy.get('[data-cy="search-input"]')
                .parent()
                .parent()
                .find('button[type="button"]')
                .first()
                .click();

            cy.wait('@addCollab');
            cy.contains('Co-cook added').should('be.visible');

            // 4. Close DraftInviteModal and DraftsModal
            cy.get('[data-testid="draft-invite-modal"]')
                .parents('.fixed')
                .find('[data-cy="modal-action-button"]')
                .click();
            cy.get('[data-testid="draft-invite-modal"]').should('not.exist');
            cy.get('[data-testid="close-modal-button"]').first().click();
            cy.get('[data-testid="drafts-modal"]').should('not.exist');

            // 5. Switch to Chef Maria session
            cy.env(['userTestPassword']).then((envVars) => {
                const password = envVars.userTestPassword || 'test';
                cy.login('chef.maria@jorbites.com', password);
            });
            cy.visit('/');
            cy.ensureEnglish();

            // 6. Chef Maria checks access to the recipe via My Drafts
            cy.get('[data-cy="user-menu"]').click();
            cy.get('[data-cy="user-menu-my-drafts"]')
                .should('be.visible')
                .click();
            cy.get('[data-testid="drafts-modal"]').should('be.visible');

            // The shared draft appears in Chef Maria's drafts
            cy.contains('[data-testid="draft-card"]', collabRecipeTitle).should(
                'be.visible'
            );

            // 7. Chef Maria opens the shared draft
            cy.contains('[data-testid="draft-card"]', collabRecipeTitle)
                .find('[data-testid="draft-card-title"]')
                .click();

            // 8. RecipeModal opens with draft loaded
            cy.get('[data-testid="modal-title"]', {
                timeout: 10000,
            }).should('be.visible');

            // Verify Chef Maria has editor role (not viewer)
            cy.get('[data-testid="viewer-mode-banner"]').should('not.exist');

            // 9. Chef Maria edits the recipe description
            const mariaEditedDesc =
                'Updated description by Chef Maria as collaborative editor!';
            cy.get('[data-cy="recipe-description"]')
                .should('be.visible')
                .clear()
                .type(mariaEditedDesc);
            cy.get('[data-cy="recipe-description"]').should(
                'have.value',
                mariaEditedDesc
            );

            // 10. Chef Maria saves the draft
            cy.intercept('POST', '/api/draft').as('saveMariaDraft');
            cy.get('[data-testid="load-draft-button"]').click();
            cy.wait('@saveMariaDraft')
                .its('response.statusCode')
                .should('eq', 200);
            cy.contains('Draft saved').should('be.visible');

            // 11. Chef Maria advances to next step and edits ingredient
            cy.get('[data-cy="modal-action-button"]').click();
            cy.get('[data-cy="recipe-ingredient-0"]', {
                timeout: 10000,
            }).should('be.visible');
            cy.get('[data-cy="recipe-ingredient-0"]')
                .clear()
                .type('Organic Rolled Oats 100g');
            cy.get('[data-cy="recipe-ingredient-0"]').should(
                'have.value',
                'Organic Rolled Oats 100g'
            );
        });
    });
});
