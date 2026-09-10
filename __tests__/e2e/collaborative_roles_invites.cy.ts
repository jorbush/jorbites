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
            expect(draftId).to.be.a('string');

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
            expect(initialToken).to.be.a('string');

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
            expect(res.body.draftId).to.be.a('string');

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
            expect(res.body.draftId).to.be.a('string');

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
                .contains('button[type="button"]', 'Chef Maria')
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
            cy.contains('[data-testid="draft-card"]', collabRecipeTitle, {
                timeout: 10000,
            }).should('be.visible');

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

    it('promotes a solo draft to shared and adds collaborator when searching on a solo draft', () => {
        const soloDraftTitle = `Solo Promo ${Date.now().toString().slice(-4)}`;

        // 1. Owner creates a pure SOLO draft via POST /api/draft (no invite token)
        cy.request({
            method: 'POST',
            url: '/api/draft',
            body: {
                title: soloDraftTitle,
                description: 'Testing solo-to-shared promotion via user search',
                categories: ['Dinner'],
            },
        }).then((res) => {
            expect(res.status).to.eq(200);
            const draftId = res.body.draftId;
            expect(draftId).to.be.a('string');

            // 2. Open My Drafts and verify it starts with Solo badge
            cy.get('[data-cy="user-menu"]').click();
            cy.get('[data-cy="user-menu-my-drafts"]')
                .should('be.visible')
                .click();
            cy.get('[data-testid="drafts-modal"]').should('be.visible');

            cy.contains('[data-testid="draft-card"]', soloDraftTitle)
                .should('contain', 'Solo')
                .find('[data-testid="draft-card-manage-collabs"]')
                .click();

            // 3. DraftInviteModal opens and auto-generates invite token on mount
            cy.get('[data-testid="draft-invite-modal"]').should('be.visible');
            cy.get('[data-testid="invite-link-input"]', { timeout: 10000 })
                .should('be.visible')
                .invoke('val')
                .should('include', draftId);

            // 4. Search and add Chef Maria directly
            cy.intercept('GET', '/api/search?q=*&type=users').as('searchUsers');
            cy.intercept('POST', '/api/draft/collaborator').as('addCollab');

            cy.get('[data-cy="search-input"]').type('Chef Maria');
            cy.wait('@searchUsers');
            cy.get('[data-cy="search-input"]')
                .parent()
                .parent()
                .contains('button[type="button"]', 'Chef Maria')
                .click();

            cy.wait('@addCollab').then((interception) => {
                expect(interception.response?.statusCode).to.eq(200);
            });
            cy.contains('Co-cook added').should('be.visible');

            // 5. Close DraftInviteModal and verify draft card now displays Shared badge
            cy.get('[data-testid="draft-invite-modal"]')
                .parents('.fixed')
                .find('[data-cy="modal-action-button"]')
                .click();
            cy.get('[data-testid="draft-invite-modal"]').should('not.exist');

            cy.contains('[data-testid="draft-card"]', soloDraftTitle).should(
                'contain',
                'Shared'
            );
        });
    });

    it('enforces viewer role restrictions (viewer banner, inert inputs, disabled save) when co-cook is set to viewer', () => {
        const viewerRecipeTitle = `Viewer Test ${Date.now().toString().slice(-4)}`;

        // 1. Owner creates a draft
        cy.request({
            method: 'POST',
            url: '/api/draft/invite',
            body: {
                title: viewerRecipeTitle,
                description: 'Recipe where Chef Maria will be viewer',
                categories: ['Dessert'],
                ingredients: ['Sugar: 100g'],
                method: 'Bake',
                steps: ['Mix and bake'],
                currentStep: 1,
            },
        }).then((res) => {
            expect(res.body.draftId).to.be.a('string');

            // 2. Open My Drafts and DraftInviteModal
            cy.get('[data-cy="user-menu"]').click();
            cy.get('[data-cy="user-menu-my-drafts"]')
                .should('be.visible')
                .click();
            cy.get('[data-testid="drafts-modal"]').should('be.visible');
            cy.contains('[data-testid="draft-card"]', viewerRecipeTitle)
                .find('[data-testid="draft-card-manage-collabs"]')
                .click();

            cy.get('[data-testid="draft-invite-modal"]').should('be.visible');

            // 3. Add Chef Maria
            cy.intercept('GET', '/api/search?q=*&type=users').as('searchUsers');
            cy.intercept('POST', '/api/draft/collaborator').as('addCollab');
            cy.intercept('PATCH', '/api/draft/role').as('updateRole');

            cy.get('[data-cy="search-input"]').type('Chef Maria');
            cy.wait('@searchUsers');
            cy.get('[data-cy="search-input"]')
                .parent()
                .parent()
                .find('button[type="button"]')
                .first()
                .click();

            cy.wait('@addCollab');
            cy.contains('Co-cook added').should('be.visible');

            // 4. Change role to viewer
            cy.get('select[data-testid^="role-select-"]')
                .should('be.visible')
                .select('viewer');
            cy.wait('@updateRole');

            // 5. Close DraftInviteModal and DraftsModal
            cy.get('[data-testid="draft-invite-modal"]')
                .parents('.fixed')
                .find('[data-cy="modal-action-button"]')
                .click();
            cy.get('[data-testid="draft-invite-modal"]').should('not.exist');
            cy.get('[data-testid="close-modal-button"]').first().click();
            cy.get('[data-testid="drafts-modal"]').should('not.exist');

            // 6. Switch session to Chef Maria
            cy.env(['userTestPassword']).then((envVars) => {
                const password = envVars.userTestPassword || 'test';
                cy.login('chef.maria@jorbites.com', password);
            });
            cy.visit('/');
            cy.ensureEnglish();

            // 7. Chef Maria opens draft
            cy.get('[data-cy="user-menu"]').click();
            cy.get('[data-cy="user-menu-my-drafts"]')
                .should('be.visible')
                .click();
            cy.get('[data-testid="drafts-modal"]').should('be.visible');

            cy.contains('[data-testid="draft-card"]', viewerRecipeTitle)
                .find('[data-testid="draft-card-title"]')
                .click();

            // 8. RecipeModal opens with draft loaded
            cy.get('[data-testid="modal-title"]', {
                timeout: 10000,
            }).should('be.visible');

            // 9. Verify viewer banner is displayed
            cy.get('[data-testid="viewer-banner"]').should('be.visible');

            // 10. Verify locked-step-container has inert attribute and pointer-events-none class
            cy.get('[data-testid="locked-step-container"]').should(
                'have.attr',
                'inert'
            );
            cy.get('[data-testid="locked-step-container"]').should(
                'have.class',
                'pointer-events-none'
            );

            // 11. Verify save draft button is disabled
            cy.get('[data-testid="load-draft-button"]').should('be.disabled');
        });
    });

    it('collaborator view: renders read-only permissions and allows collaborator to leave draft', () => {
        const collabTitle = `Leave Draft Test ${Date.now().toString().slice(-4)}`;

        // 1. Owner creates a draft
        cy.request({
            method: 'POST',
            url: '/api/draft/invite',
            body: {
                title: collabTitle,
                categories: ['Breakfast'],
            },
        }).then((res) => {
            const draftId = res.body.draftId;
            expect(draftId).to.be.a('string');

            // Find Chef Maria via search API
            cy.request('GET', '/api/search?q=Maria&type=users').then(
                (searchRes) => {
                    const maria = searchRes.body.users.find(
                        (u: { name?: string }) => u.name?.includes('Maria')
                    );
                    expect(maria).to.be.an('object');

                    // Add Maria as collaborator
                    cy.request({
                        method: 'POST',
                        url: '/api/draft/collaborator',
                        body: {
                            draftId,
                            userId: maria.id,
                            role: 'editor',
                        },
                    }).then((collabRes) => {
                        expect(collabRes.status).to.eq(200);

                        // 2. Switch to Chef Maria session
                        cy.env(['userTestPassword']).then((envVars) => {
                            const password = envVars.userTestPassword || 'test';
                            cy.login('chef.maria@jorbites.com', password);
                        });
                        cy.visit('/');
                        cy.ensureEnglish();

                        // 3. Chef Maria opens My Drafts
                        cy.get('[data-cy="user-menu"]').click();
                        cy.get('[data-cy="user-menu-my-drafts"]')
                            .should('be.visible')
                            .click();
                        cy.get('[data-testid="drafts-modal"]').should(
                            'be.visible'
                        );

                        // Draft card is visible with Shared badge
                        cy.contains('[data-testid="draft-card"]', collabTitle)
                            .should('be.visible')
                            .and('contain', 'Shared');

                        // Open DraftInviteModal as collaborator
                        cy.contains('[data-testid="draft-card"]', collabTitle)
                            .find('[data-testid="draft-card-manage-collabs"]')
                            .click();

                        cy.get('[data-testid="draft-invite-modal"]').should(
                            'be.visible'
                        );

                        // Non-owner should NOT see regenerate button or user search input
                        cy.get(
                            '[data-testid="regenerate-invite-link-btn"]'
                        ).should('not.exist');
                        cy.get('[data-cy="search-input"]').should('not.exist');

                        // Non-owner should NOT see role select dropdowns (sees badge instead)
                        cy.get(
                            `[data-testid="role-select-${maria.id}"]`
                        ).should('not.exist');
                        cy.get(`[data-testid="role-badge-${maria.id}"]`).should(
                            'be.visible'
                        );

                        // Non-owner should NOT see delete/trash button on the owner
                        cy.get('[data-testid^="remove-collaborator-"]').should(
                            'not.exist'
                        );

                        // Non-owner SHOULD see leave draft button on their own item
                        cy.get('[data-testid="leave-draft-btn"]')
                            .should('be.visible')
                            .click();

                        // Toast appears and modal closes
                        cy.contains('You have left the draft').should(
                            'be.visible'
                        );
                        cy.get('[data-testid="draft-invite-modal"]').should(
                            'not.exist'
                        );

                        // Draft is now gone from Chef Maria's My Drafts
                        cy.contains(
                            '[data-testid="draft-card"]',
                            collabTitle
                        ).should('not.exist');
                    });
                }
            );
        });
    });

    it('invalidates previous invite token on regeneration and allows joining with new token', () => {
        const title = `Token Regen Test ${Date.now().toString().slice(-4)}`;

        // 1. Owner creates a draft
        cy.request({
            method: 'POST',
            url: '/api/draft/invite',
            body: {
                title,
                categories: ['Dessert'],
            },
        }).then((res) => {
            const draftId = res.body.draftId;
            const originalToken = res.body.inviteToken;
            expect(draftId).to.be.a('string');
            expect(originalToken).to.be.a('string');

            // 2. Owner opens My Drafts and opens DraftInviteModal
            cy.get('[data-cy="user-menu"]').click();
            cy.get('[data-cy="user-menu-my-drafts"]')
                .should('be.visible')
                .click();
            cy.get('[data-testid="drafts-modal"]').should('be.visible');
            cy.contains('[data-testid="draft-card"]', title)
                .find('[data-testid="draft-card-manage-collabs"]')
                .click();

            cy.get('[data-testid="draft-invite-modal"]').should('be.visible');

            // 3. Click Regenerate link, show confirm box, and confirm
            cy.get('[data-testid="regenerate-invite-link-btn"]').click();
            cy.get('[data-testid="regenerate-confirm-box"]').should(
                'be.visible'
            );

            cy.intercept('POST', '/api/draft/invite').as('regenRequest');
            cy.get('[data-testid="regenerate-confirm-btn"]').click();
            cy.wait('@regenRequest').then((regenInterception) => {
                expect(regenInterception.response?.statusCode).to.eq(200);
                const newToken = regenInterception.response?.body.inviteToken;
                expect(newToken).to.be.a('string');
                expect(newToken).to.not.eq(originalToken);

                // 4. Switch to Chef Maria session
                cy.env(['userTestPassword']).then((envVars) => {
                    const password = envVars.userTestPassword || 'test';
                    cy.login('chef.maria@jorbites.com', password);
                });

                // 5. Try joining with the OLD token -> rejected with error redirect
                cy.request({
                    method: 'GET',
                    url: `/api/draft/join?draft=${draftId}&token=${originalToken}`,
                    followRedirect: false,
                    failOnStatusCode: false,
                }).then((joinRes) => {
                    expect(joinRes.headers.location).to.include(
                        'error=invalid_invite_token'
                    );
                });

                // 6. Join with the NEW token -> succeeds and opens draft
                cy.visit(`/api/draft/join?draft=${draftId}&token=${newToken}`);
                cy.url().should('include', `draft=${draftId}`);
                cy.url().should('include', 'joined=true');
                cy.get('[data-testid="modal-title"]', {
                    timeout: 10000,
                }).should('be.visible');
            });
        });
    });

    it('enforces maximum 4 co-cooks quota with disabled search and warning banner, dynamically re-enabling on removal', () => {
        const title = `Quota Test ${Date.now().toString().slice(-4)}`;

        // Create draft with 4 collaborator IDs
        cy.request({
            method: 'POST',
            url: '/api/draft/invite',
            body: {
                title,
                categories: ['Dinner'],
                coCooksIds: [
                    'collab-user-1',
                    'collab-user-2',
                    'collab-user-3',
                    'collab-user-4',
                ],
            },
        }).then((res) => {
            expect(res.status).to.eq(200);

            // Open My Drafts and DraftInviteModal
            cy.get('[data-cy="user-menu"]').click();
            cy.get('[data-cy="user-menu-my-drafts"]')
                .should('be.visible')
                .click();
            cy.get('[data-testid="drafts-modal"]').should('be.visible');
            cy.contains('[data-testid="draft-card"]', title)
                .find('[data-testid="draft-card-manage-collabs"]')
                .click();

            cy.get('[data-testid="draft-invite-modal"]').should('be.visible');

            // Quota is 4: search input should be disabled and warning shown
            cy.get('[data-cy="search-input"]').should('be.disabled');
            cy.contains('Maximum of 4 co-cooks allowed').should('be.visible');

            // Remove 1 collaborator
            cy.get('[data-testid="remove-collaborator-collab-user-4"]').click();
            cy.contains('Co-cook removed').should('be.visible');

            // Now 3 co-cooks: search input should become re-enabled and warning should disappear
            cy.get('[data-cy="search-input"]').should('not.be.disabled');
            cy.contains('Maximum of 4 co-cooks allowed').should('not.exist');
        });
    });

    it('revokes draft access immediately from kicked collaborator session', () => {
        const collabTitle = `Revoke Access Test ${Date.now().toString().slice(-4)}`;

        // 1. Owner creates a draft and adds Chef Maria
        cy.request({
            method: 'POST',
            url: '/api/draft/invite',
            body: {
                title: collabTitle,
                categories: ['Breakfast'],
            },
        }).then((res) => {
            const draftId = res.body.draftId;
            expect(draftId).to.be.a('string');

            cy.request('GET', '/api/search?q=Maria&type=users').then(
                (searchRes) => {
                    const maria = searchRes.body.users.find(
                        (u: { name?: string }) => u.name?.includes('Maria')
                    );
                    expect(maria).to.be.an('object');

                    cy.request({
                        method: 'POST',
                        url: '/api/draft/collaborator',
                        body: {
                            draftId,
                            userId: maria.id,
                            role: 'editor',
                        },
                    }).then(() => {
                        // 2. Owner opens DraftInviteModal and removes Chef Maria
                        cy.get('[data-cy="user-menu"]').click();
                        cy.get('[data-cy="user-menu-my-drafts"]')
                            .should('be.visible')
                            .click();
                        cy.get('[data-testid="drafts-modal"]').should(
                            'be.visible'
                        );
                        cy.contains('[data-testid="draft-card"]', collabTitle)
                            .find('[data-testid="draft-card-manage-collabs"]')
                            .click();

                        cy.get(
                            `[data-testid="remove-collaborator-${maria.id}"]`
                        ).click();
                        cy.contains('Co-cook removed').should('be.visible');

                        // 3. Switch to Chef Maria session
                        cy.env(['userTestPassword']).then((envVars) => {
                            const password = envVars.userTestPassword || 'test';
                            cy.login('chef.maria@jorbites.com', password);
                        });
                        cy.visit('/');
                        cy.ensureEnglish();

                        // 4. Chef Maria checks My Drafts -> draft must not be listed
                        cy.get('[data-cy="user-menu"]').click();
                        cy.get('[data-cy="user-menu-my-drafts"]')
                            .should('be.visible')
                            .click();
                        cy.get('[data-testid="drafts-modal"]').should(
                            'be.visible'
                        );
                        cy.contains(
                            '[data-testid="draft-card"]',
                            collabTitle
                        ).should('not.exist');

                        // 5. Chef Maria directly attempts to fetch the draft -> rejected (403 or 404)
                        cy.request({
                            method: 'GET',
                            url: `/api/draft?draftId=${draftId}`,
                            failOnStatusCode: false,
                        }).then((fetchRes) => {
                            expect(fetchRes.status).to.be.oneOf([403, 404]);
                        });
                    });
                }
            );
        });
    });

    it('verifies RelatedContentStep contains only recipes, quests, and videos without co-cooks tab or share button', () => {
        // 1. Create a draft at step 5 (Related Content)
        cy.request({
            method: 'POST',
            url: '/api/draft',
            body: {
                title: 'Related Content Cleanliness Test',
                categories: ['Dessert'],
                currentStep: 5,
            },
        }).then((res) => {
            const draftId = res.body.draftId;
            expect(draftId).to.be.a('string');

            // 2. Open the draft directly in RecipeModal
            cy.visit(`/?draft=${draftId}`);
            cy.get('[data-testid="modal-title"]', {
                timeout: 10000,
            }).should('be.visible');

            // 3. Verify RelatedContentStep is active and tab bar is visible
            cy.get('[data-testid="related-content-tabs"]').should('be.visible');

            // 4. Verify co-cooks tab is NOT present
            cy.get('[data-testid="related-content-tabs"]')
                .should('contain', 'Linked Recipes')
                .and('contain', 'Quests')
                .and('contain', 'Videos')
                .and('not.contain', 'Co-cook');

            // 5. Verify share invite link button is NOT present in Related Content step
            cy.get('[data-testid="share-invite-link-btn"]').should('not.exist');
            cy.get('[data-testid="generate-invite-link-btn"]').should(
                'not.exist'
            );

            // 6. Verify tabs can be switched between Linked Recipes, Quests, and Videos
            cy.get('[data-testid="related-content-tabs"]')
                .contains('Quests')
                .click();
            cy.get('label').should('contain', 'Search Quests');

            cy.get('[data-testid="related-content-tabs"]')
                .contains('Videos')
                .click();
            cy.get('label').should('contain', 'YouTube Video URL');
        });
    });
});
