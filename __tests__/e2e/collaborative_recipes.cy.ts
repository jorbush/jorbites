describe('Collaborative Recipes & Co-Cooking E2E', () => {
    let createdRecipeIds: string[] = [];

    const cleanupResources = () => {
        // Clean up created recipes in database
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

        // Clean up any remaining drafts in Redis
        cy.request({
            method: 'DELETE',
            url: '/api/draft',
            failOnStatusCode: false,
        });
    };

    beforeEach(() => {
        cy.login();
        cy.visit('/');

        // Clear any leftover drafts in Redis for clean test isolation
        cleanupResources();

        cy.ensureEnglish();
    });

    afterEach(() => {
        // Always clean up created recipes and drafts even on failure
        cleanupResources();
    });

    after(() => {
        // Final suite cleanup pass
        cleanupResources();
    });

    it('complete collaborative recipe lifecycle - create with co-cook, sync steps, and publish', () => {
        const recipeName = 'Collaborative Berry Tart';
        const recipeDescription =
            'Delicious berry tart created together by culinary co-cooks.';

        // STEP 1: Open Recipe Wizard
        cy.task('log', '=== STEP 1: Opening Recipe Wizard ===');
        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');

        // Fill Category Step
        cy.get('[data-cy="category-box-Desserts"]').click();
        cy.task('log', 'Category selected');
        cy.get('[data-cy="modal-action-button"]')
            .should('not.be.disabled')
            .click();

        // Fill Description Step
        cy.get('[data-cy="recipe-title"]').type(recipeName);
        cy.get('[data-cy="recipe-description"]').type(recipeDescription);
        cy.task('log', 'Title and description filled');
        cy.get('[data-cy="modal-action-button"]')
            .should('not.be.disabled')
            .click();

        // Fill Ingredients Step
        cy.get('[data-cy="recipe-ingredient-0"]').type('Fresh Blueberries');
        cy.get('[data-cy="add-ingredient-button"]').click();
        cy.get('[data-cy="recipe-ingredient-1"]').type('Greek Yogurt');
        cy.task('log', 'Ingredients filled');
        cy.get('[data-cy="modal-action-button"]')
            .should('not.be.disabled')
            .click();

        // Fill Cooking Method Step
        cy.get('[data-cy="method-box-Oven"]').click();
        cy.task('log', 'Cooking method selected');
        cy.get('[data-cy="modal-action-button"]')
            .should('not.be.disabled')
            .click();

        // Fill Steps Step
        cy.get('[data-cy="recipe-step-0"]').type(
            'Mix yogurt and berries gently in a bowl.'
        );
        cy.get('[data-cy="add-step-button"]').click();
        cy.get('[data-cy="recipe-step-1"]').type(
            'Bake crust and layer with fruit mixture.'
        );
        cy.task('log', 'Steps filled');
        cy.get('[data-cy="modal-action-button"]')
            .should('not.be.disabled')
            .click();

        // STEP 2: Related Content & Co-Cook Selection
        cy.task('log', '=== STEP 2: Adding Co-Cook Collaborator ===');
        cy.get('[data-testid="related-content-tabs"]').should('exist');

        // Mock search response with valid 24-character hexadecimal MongoDB ObjectId
        cy.intercept('GET', '/api/search?q=*&type=users', {
            statusCode: 200,
            body: {
                users: [
                    {
                        id: '507f1f77bcf86cd799439011',
                        name: 'Chef Maria',
                        image: '/avocado.webp',
                        verified: true,
                        level: 5,
                    },
                ],
                recipes: [],
            },
        }).as('searchUsers');

        // Search for user
        cy.get('[data-cy="search-input"]').type('Chef Maria');
        cy.wait('@searchUsers');

        // Select Maria as co-cook
        cy.contains('Chef Maria').click();
        cy.task('log', 'Chef Maria selected as co-cook');

        // Verify selected co-cook is displayed in SelectedCoCooksList
        cy.contains('Chef Maria').should('be.visible');
        cy.contains('(1/4)').should('be.visible');

        // Proceed to next step
        cy.get('[data-cy="modal-action-button"]')
            .should('not.be.disabled')
            .click();

        // STEP 3: Images Step & Publish Recipe
        cy.task('log', '=== STEP 3: Publishing Collaborative Recipe ===');
        cy.intercept('POST', '/api/recipes').as('createRecipe');
        cy.get('[data-cy="modal-action-button"]')
            .should('not.be.disabled')
            .click();

        cy.wait('@createRecipe').then((interception) => {
            expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
            // Verify payload includes coCooksIds
            expect(interception.request.body.coCooksIds).to.include(
                '507f1f77bcf86cd799439011'
            );
            if (interception.response?.body?.id) {
                createdRecipeIds.push(interception.response.body.id);
            }
        });

        cy.get('[class^="go"]', { timeout: 10000 }).should('be.visible');
        cy.wait(1000);

        // STEP 4: Verify Published Recipe and Co-Cook Display
        cy.task('log', '=== STEP 4: Verifying Recipe Page and Co-Cooks ===');
        cy.get('[data-cy="recipe-card-title"]')
            .contains(recipeName)
            .should('be.visible')
            .click({ force: true });

        cy.url().should('include', '/recipes/');
        cy.get('[data-cy="recipe-title-display"]').should(
            'contain',
            recipeName
        );
        cy.get('[data-cy="recipe-description-display"]').should(
            'contain',
            recipeDescription
        );
        cy.task('log', '✓ Recipe verified on detail page');
    });

    it('generates co-cook invite link, stores shared draft in Redis, and handles join URL', () => {
        cy.task('log', '=== Generating Invite Link from RecipeModal ===');
        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');

        // Fill initial step
        cy.get('[data-cy="category-box-Desserts"]').click();
        cy.get('[data-cy="modal-action-button"]')
            .should('not.be.disabled')
            .click();
        cy.get('[data-cy="recipe-title"]').type('Shared Breakfast Bowl');

        // Click Copy Invite Link button in header
        cy.intercept('POST', '/api/draft/invite').as('generateInvite');
        cy.get('[data-testid="copy-co-cook-link-button"]').click();

        let generatedDraftId = '';
        let generatedToken = '';

        cy.wait('@generateInvite').then((interception) => {
            expect(interception.response?.statusCode).to.eq(200);
            expect(interception.response?.body).to.have.property('draftId');
            expect(interception.response?.body).to.have.property('inviteToken');
            generatedDraftId = interception.response?.body.draftId;
            generatedToken = interception.response?.body.inviteToken;
            cy.task(
                'log',
                `Generated Shared Draft: ${generatedDraftId}, Token: ${generatedToken}`
            );
        });

        // Verify toast notification
        cy.contains('Co-cook invite link copied to clipboard').should(
            'be.visible'
        );

        // Close modal and verify query param cleanup
        cy.get('[data-testid="close-modal-button"]').click();
        cy.url().should('not.include', 'draft=');

        // Now test joining the shared draft via tokenized URL
        cy.task('log', '=== Joining Shared Draft via Join URL ===');
        cy.then(() => {
            cy.visit(
                `/api/draft/join?draft=${generatedDraftId}&token=${generatedToken}`
            );
            // Verify redirected to home with draft open
            cy.url().should('include', `draft=${generatedDraftId}`);
            cy.get('[data-testid="modal-title"]').should('be.visible');

            // Verify title is pre-populated from Redis draft state
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click(); // Next to description
            cy.get('[data-cy="recipe-title"]').should(
                'have.value',
                'Shared Breakfast Bowl'
            );

            // Close modal cleanly
            cy.get('[data-testid="close-modal-button"]').click();
        });
    });

    it('syncs step changes across co-cooks when navigating back and forward', () => {
        cy.task(
            'log',
            '=== Testing Step Navigation Real-Time Synchronization ==='
        );

        // Seed a shared draft in Redis via API
        cy.request('POST', '/api/draft/invite', {
            categories: ['Desserts'],
            title: 'Collaborative Chocolate Cake',
            description: 'Original description by User A',
            ingredients: ['2 cups Flour', '1 cup Sugar'],
            method: 'Oven',
            steps: ['Mix ingredients', 'Bake at 180C for 30 mins'],
        }).then((response) => {
            const draftId = response.body.draftId;

            // Visit the shared draft URL on the root page
            cy.visit(`/?draft=${draftId}`);
            cy.get('[data-testid="modal-title"]', { timeout: 10000 }).should(
                'be.visible'
            );

            // Navigate to Description Step (Step 1)
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click();
            cy.get('[data-cy="recipe-title"]').should(
                'have.value',
                'Collaborative Chocolate Cake'
            );
            cy.get('[data-cy="recipe-description"]').should(
                'have.value',
                'Original description by User A'
            );

            // Simulate Co-Cook updating the ingredients & steps in Redis concurrently
            const updatedIngredients = [
                '2 cups Flour',
                '1 cup Sugar',
                '1/2 cup Cocoa Powder (added by Co-Cook)',
            ];
            const updatedSteps = [
                'Mix ingredients thoroughly',
                'Bake at 180C for 30 mins',
                'Top with chocolate ganache (added by Co-Cook)',
            ];

            cy.request('POST', '/api/draft', {
                draftId,
                title: 'Collaborative Chocolate Cake',
                description: 'Original description by User A',
                ingredients: updatedIngredients,
                steps: updatedSteps,
            }).then(() => {
                // User navigates forward to Ingredients Step (Step 2)
                cy.get('[data-cy="modal-action-button"]')
                    .should('not.be.disabled')
                    .click();

                // Verify updated ingredients authored by Co-Cook are synced into the view!
                cy.get('[data-cy="recipe-ingredient-0"]').should(
                    'have.value',
                    '2 cups Flour'
                );
                cy.get('[data-cy="recipe-ingredient-2"]', {
                    timeout: 10000,
                }).should(
                    'have.value',
                    '1/2 cup Cocoa Powder (added by Co-Cook)'
                );

                // User navigates forward to Methods (Step 3)
                cy.get('[data-cy="modal-action-button"]')
                    .should('not.be.disabled')
                    .click();
                cy.get('[data-cy="method-box-Oven"]').should('be.visible');

                // User navigates forward to Steps (Step 4)
                cy.get('[data-cy="modal-action-button"]')
                    .should('not.be.disabled')
                    .click();

                // Verify updated steps authored by Co-Cook are synced into the view!
                cy.get('[data-cy="recipe-step-0"]').should(
                    'have.value',
                    'Mix ingredients thoroughly'
                );
                cy.get('[data-cy="recipe-step-2"]', { timeout: 10000 }).should(
                    'have.value',
                    'Top with chocolate ganache (added by Co-Cook)'
                );

                // User navigates BACK to Methods (Step 3)
                cy.get('[data-testid="secondary-action-button"]').click();
                cy.get('[data-cy="method-box-Oven"]').should('be.visible');

                // User navigates BACK to Ingredients (Step 2) and verifies state is preserved
                cy.get('[data-testid="secondary-action-button"]').click();

                cy.get('[data-cy="recipe-ingredient-2"]').should(
                    'have.value',
                    '1/2 cup Cocoa Powder (added by Co-Cook)'
                );
                cy.task(
                    'log',
                    '✓ Real-time multi-user step sync verified on forward and back navigation'
                );
            });
        });
    });

    it('displays soft-lock banners and co-cook activity indicators from Redis locks', () => {
        cy.task(
            'log',
            '=== Testing Redis Soft-Locking and Activity Banners ==='
        );

        cy.request('POST', '/api/draft/invite', {
            categories: ['Desserts'],
            title: 'Locked Step Demo Recipe',
        }).then((response) => {
            const draftId = response.body.draftId;

            // Intercept lock status endpoint to simulate co-cook holding lock on current step
            cy.intercept('GET', `/api/recipes/${draftId}/lock`, {
                statusCode: 200,
                body: {
                    'step:0': {
                        userId: 'other-user-maria',
                        userName: 'maria',
                        timestamp: Date.now(),
                    },
                    'step:3': {
                        userId: 'other-user-alex',
                        userName: 'alex',
                        timestamp: Date.now(),
                    },
                },
            }).as('getLocks');

            cy.visit(`/?draft=${draftId}`);
            cy.get('[data-testid="modal-title"]').should('be.visible');

            // Verify lock banner on current step (step:0)
            cy.get('[data-testid="lock-banner"]', { timeout: 10000 })
                .should('be.visible')
                .and('contain', '@maria is currently editing this step');

            // Intercept lock status when user is on a step where another user edits a different step
            cy.intercept('GET', `/api/recipes/${draftId}/lock`, {
                statusCode: 200,
                body: {
                    'step:3': {
                        userId: 'other-user-alex',
                        userName: 'alex',
                        timestamp: Date.now(),
                    },
                },
            }).as('getLocksDifferentStep');

            // Next step (Description - step 1)
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click();

            // Verify co-cook activity banner is shown for the other step being edited
            cy.get('[data-testid="co-cook-activity-banner"]', {
                timeout: 10000,
            })
                .should('be.visible')
                .and('contain', '@alex is currently editing another step');

            cy.task(
                'log',
                '✓ Redis section soft-locking & activity banners verified'
            );
        });
    });
});
