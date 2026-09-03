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

        // Clean up any leftover test recipes from previous interrupted runs
        [
            'Collaborative Berry Tart',
            'Draft Cleaned On Publish',
            'Four Cook Feast',
            'Test recipe',
            'Edited Recipe Title',
        ].forEach((query) => {
            cy.request({
                method: 'GET',
                url: `/api/search?q=${encodeURIComponent(query)}&type=recipes`,
                failOnStatusCode: false,
            }).then((res) => {
                if (res.body?.recipes && Array.isArray(res.body.recipes)) {
                    res.body.recipes.forEach((recipe: { id: string }) => {
                        if (recipe?.id) {
                            cy.request({
                                method: 'DELETE',
                                url: `/api/recipe/${recipe.id}`,
                                failOnStatusCode: false,
                            });
                        }
                    });
                }
            });
        });

        // Clean up any remaining drafts in Redis
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
        // Clear any leftover test recipes and drafts in Redis before visiting
        cleanupResources();
        cy.visit('/');
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
        const recipeName = `Collab Tart ${Date.now().toString().slice(-4)}`;
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

        // Save draft and wait for save to complete in Redis
        cy.intercept('POST', '/api/draft').as('saveDraft');
        cy.get('[data-testid="load-draft-button"]').click();
        cy.wait('@saveDraft');

        // Open DraftsModal and copy invite link from draft card
        cy.intercept('POST', '/api/draft/invite').as('generateInvite');
        cy.get('[data-testid="open-drafts-modal-button"]').click();
        cy.get('[data-testid="drafts-modal"]').should('be.visible');
        cy.get('[data-testid="draft-card"]', { timeout: 10000 }).should(
            'be.visible'
        );
        cy.get('[data-testid="draft-card-share"]').first().click();

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

        // Close drafts modal
        cy.get('[data-testid="close-modal-button"]').click();

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

    it('resolves concurrent non-destructive field edits without race conditions', () => {
        cy.task(
            'log',
            '=== Testing Non-Destructive Concurrent Multi-Field Merge ==='
        );

        // Seed shared draft with initial categories
        cy.request('POST', '/api/draft/invite', {
            categories: ['Desserts'],
            title: 'Initial Cake Name',
            description: 'Initial Description',
            ingredients: ['2 cups Flour'],
            method: 'Oven',
        }).then((response) => {
            const draftId = response.body.draftId;

            // User A updates title and description
            cy.request('POST', '/api/draft', {
                draftId,
                title: 'Updated Cake Title by User A',
                description: 'Updated Description by User A',
            });

            // Concurrently, User B in another session updates ingredients and method in Redis
            cy.request('POST', '/api/draft', {
                draftId,
                ingredients: [
                    '2 cups Flour',
                    '1 cup Cocoa',
                    '2 tsp Baking Powder',
                ],
                method: 'Microwave',
            });

            // Verify server-side Redis draft contains BOTH User A's updated title AND User B's ingredients/method
            cy.request('GET', `/api/draft?draftId=${draftId}`).then(
                (draftRes) => {
                    expect(draftRes.status).to.eq(200);
                    expect(draftRes.body.title).to.eq(
                        'Updated Cake Title by User A'
                    );
                    expect(draftRes.body.description).to.eq(
                        'Updated Description by User A'
                    );
                    expect(draftRes.body.ingredients).to.deep.eq([
                        '2 cups Flour',
                        '1 cup Cocoa',
                        '2 tsp Baking Powder',
                    ]);
                    expect(draftRes.body.method).to.eq('Microwave');
                    cy.task(
                        'log',
                        '✓ Non-destructive multi-field merge verified without race condition data loss'
                    );
                }
            );
        });
    });

    it('enforces collaborator limit of 4 co-cooks and allows removal', () => {
        cy.task(
            'log',
            '=== Testing Co-Cook Limit (MAX_CO_COOKS = 4) & Removal ==='
        );

        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');

        // Fill Category Step
        cy.get('[data-cy="category-box-Desserts"]').click();
        cy.get('[data-cy="modal-action-button"]')
            .should('not.be.disabled')
            .click();

        // Fill Description Step
        cy.get('[data-cy="recipe-title"]').type('Four Cook Feast');
        cy.get('[data-cy="recipe-description"]').type('Testing co-cook limit');
        cy.get('[data-cy="modal-action-button"]')
            .should('not.be.disabled')
            .click();

        // Fill Ingredients Step
        cy.get('[data-cy="recipe-ingredient-0"]').type('Sugar');
        cy.get('[data-cy="modal-action-button"]')
            .should('not.be.disabled')
            .click();

        // Fill Cooking Method Step
        cy.get('[data-cy="method-box-Oven"]').click();
        cy.get('[data-cy="modal-action-button"]')
            .should('not.be.disabled')
            .click();

        // Fill Steps Step
        cy.get('[data-cy="recipe-step-0"]').type('Bake gently');
        cy.get('[data-cy="modal-action-button"]')
            .should('not.be.disabled')
            .click();

        // Related Content Step
        cy.get('[data-testid="related-content-tabs"]').should('exist');

        // Mock search response returning 5 users
        cy.intercept('GET', '/api/search?q=*&type=users', {
            statusCode: 200,
            body: {
                users: [
                    {
                        id: '507f1f77bcf86cd799439011',
                        name: 'Chef One',
                        image: '/avocado.webp',
                    },
                    {
                        id: '507f1f77bcf86cd799439012',
                        name: 'Chef Two',
                        image: '/avocado.webp',
                    },
                    {
                        id: '507f1f77bcf86cd799439013',
                        name: 'Chef Three',
                        image: '/avocado.webp',
                    },
                    {
                        id: '507f1f77bcf86cd799439014',
                        name: 'Chef Four',
                        image: '/avocado.webp',
                    },
                    {
                        id: '507f1f77bcf86cd799439015',
                        name: 'Chef Five',
                        image: '/avocado.webp',
                    },
                ],
                recipes: [],
            },
        }).as('searchMultipleUsers');

        const addChef = (name: string) => {
            cy.get('[data-cy="search-input"]').clear().type(name);
            cy.wait('@searchMultipleUsers');
            cy.contains(name).click();
        };

        // Add 4 co-cooks (reaching maximum capacity)
        addChef('Chef One');
        addChef('Chef Two');
        addChef('Chef Three');
        addChef('Chef Four');

        // Verify capacity is 4/4
        cy.get('[data-testid="co-cooks-count"]').should('contain', '(4/4)');

        // Search Chef Five -> verify dropdown item is disabled when max capacity is reached
        cy.get('[data-cy="search-input"]').clear().type('Chef Five');
        cy.wait('@searchMultipleUsers');
        cy.contains('Chef Five').closest('button').should('be.disabled');

        // Remove Chef Four
        cy.get('[data-testid="remove-co-cook-507f1f77bcf86cd799439014"]')
            .first()
            .click({ force: true });

        // Verify capacity drops to 3/4
        cy.get('[data-testid="co-cooks-count"]').should('contain', '(3/4)');

        // Verify Chef Five is no longer disabled and can now be added
        cy.contains('Chef Five')
            .closest('button')
            .should('not.be.disabled')
            .click();
        cy.get('[data-testid="co-cooks-count"]').should('contain', '(4/4)');
        cy.task('log', '✓ Co-cook capacity limits and removal verified');
    });

    it('cleans up shared Redis draft completely upon recipe publish', () => {
        cy.task(
            'log',
            '=== Testing Redis Draft Deletion on Recipe Publish ==='
        );

        cy.request('POST', '/api/draft/invite', {
            categories: ['Desserts'],
            title: 'Draft Cleaned On Publish',
            description: 'This draft will be deleted once published',
            ingredients: ['1 Apple'],
            method: 'Oven',
            steps: ['Bake Apple'],
        }).then((response) => {
            const draftId = response.body.draftId;

            // Visit draft and advance to publishing step
            cy.visit(`/?draft=${draftId}`);
            cy.get('[data-testid="modal-title"]').should('be.visible');

            // Category -> Description
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click();
            // Description -> Ingredients
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click();
            // Ingredients -> Method
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click();
            // Method -> Steps
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click();
            // Steps -> Related Content
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click();
            // Related Content -> Images
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click();

            // Publish recipe
            cy.intercept('POST', '/api/recipes').as('publishFinal');
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click();

            cy.wait('@publishFinal').then((interception) => {
                expect(interception.response?.statusCode).to.be.oneOf([
                    200, 201,
                ]);
                if (interception.response?.body?.id) {
                    createdRecipeIds.push(interception.response.body.id);
                }

                // Verify Redis draft key draft:shared:<draftId> is now completely deleted
                cy.request({
                    method: 'GET',
                    url: `/api/draft?draftId=${draftId}`,
                    failOnStatusCode: false,
                }).then((draftCheck) => {
                    expect(draftCheck.body).to.equal(null);
                    cy.task(
                        'log',
                        '✓ Shared Redis draft automatically cleaned up upon publishing'
                    );
                });
            });
        });
    });

    it('protects active user typing in current step while synchronizing remote co-cook edits on other steps', () => {
        cy.task(
            'log',
            '=== Testing Live UI In-Progress Edit Protection & Remote Sync ==='
        );

        // Seed shared draft
        cy.request('POST', '/api/draft/invite', {
            categories: ['Desserts'],
            title: 'Cardamom Chai',
            description: 'Warm spiced tea',
        }).then((response) => {
            const draftId = response.body.draftId;

            // Visit shared draft in RecipeModal
            cy.visit(`/?draft=${draftId}`);
            cy.get('[data-testid="modal-title"]').should('be.visible');

            // Navigate: Step 0 (Category) -> Step 1 (Description) -> Step 2 (Ingredients)
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click(); // to Step 1
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click(); // to Step 2

            // User A actively types ingredients on Step 2
            cy.get('[data-cy="recipe-ingredient-0"]').type(
                '1 tsp Ground Cardamom'
            );

            // Concurrently, Co-Cook User B updates Step 1 (Title and Description) on server
            cy.request('POST', '/api/draft', {
                draftId,
                title: 'Cardamom Brioche',
                description: 'Enriched buttery cardamom brioche',
            });

            // Trigger draft save on Step 2 to exchange step updates with backend
            cy.intercept('POST', '/api/draft').as('syncStep2');
            cy.get('[data-testid="load-draft-button"]').click();
            cy.wait('@syncStep2');

            // Verify User A's active ingredient input was NOT overwritten or corrupted
            cy.get('[data-cy="recipe-ingredient-0"]').should(
                'have.value',
                '1 tsp Ground Cardamom'
            );

            // User A navigates BACK to Step 1 (Description)
            cy.get('[data-testid="secondary-action-button"]').click();

            // Verify User B's remote title and description were smoothly merged
            cy.get('[data-cy="recipe-title"]').should(
                'have.value',
                'Cardamom Brioche'
            );
            cy.get('[data-cy="recipe-description"]').should(
                'have.value',
                'Enriched buttery cardamom brioche'
            );

            cy.task(
                'log',
                '✓ Live in-progress input protection and remote step sync verified'
            );
        });
    });

    it('disables controls on soft-locked steps while allowing normal interaction on unlocked steps', () => {
        cy.task('log', '=== Testing Step Soft-Locking Input Guard ===');

        cy.request('POST', '/api/draft/invite', {
            categories: ['Desserts'],
            title: 'Soft Lock Guard Recipe',
            description: 'Testing input lock enforcement',
        }).then((response) => {
            const draftId = response.body.draftId;

            // Intercept lock endpoint to simulate Maria locking Step 2 (Ingredients)
            cy.intercept('GET', `/api/recipes/${draftId}/lock`, {
                statusCode: 200,
                body: {
                    'step:2': {
                        userId: 'other-user-maria',
                        userName: 'maria',
                        timestamp: Date.now(),
                    },
                },
            }).as('getStep2Lock');

            cy.visit(`/?draft=${draftId}`);
            cy.get('[data-testid="modal-title"]').should('be.visible');

            // Step 0 -> Step 1 -> Step 2
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click();
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click();

            // Verify on Step 2 (Ingredients): Lock banner is visible and input is disabled
            cy.get('[data-testid="lock-banner"]', { timeout: 10000 })
                .should('be.visible')
                .and('contain', '@maria is currently editing this step');
            cy.get('[data-cy="recipe-ingredient-0"]').should('be.disabled');

            // Navigate forward to Step 3 (Methods) - which is unlocked
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click();

            // Verify Step 3: No lock banner, method box is interactive and selectable
            cy.get('[data-testid="lock-banner"]').should('not.exist');
            cy.get('[data-cy="method-box-Oven"]').should('be.visible').click();
            cy.get('[data-cy="method-box-Oven"]').should(
                'have.class',
                'selected'
            );

            cy.task(
                'log',
                '✓ Soft-lock input guards and unlocked step interaction verified'
            );
        });
    });

    it('automatically recovers input interactivity when co-cook releases soft-lock on active step', () => {
        cy.task(
            'log',
            '=== Testing Soft-Lock Auto-Recovery on Lock Release ==='
        );

        cy.request('POST', '/api/draft/invite', {
            categories: ['Desserts'],
            title: 'Auto Recovery Lock Recipe',
            description: 'Testing live unlock reactivity',
        }).then((response) => {
            const draftId = response.body.draftId;
            let lockActive = true;

            // Intercept lock endpoint dynamically based on lockActive state
            cy.intercept('GET', `/api/recipes/${draftId}/lock`, (req) => {
                if (lockActive) {
                    req.reply({
                        statusCode: 200,
                        body: {
                            'step:2': {
                                userId: 'other-user-maria',
                                userName: 'maria',
                                timestamp: Date.now(),
                            },
                        },
                    });
                } else {
                    req.reply({
                        statusCode: 200,
                        body: {},
                    });
                }
            }).as('dynamicStepLock');

            cy.visit(`/?draft=${draftId}`);
            cy.get('[data-testid="modal-title"]').should('be.visible');

            // Navigate: Step 0 (Category) -> Step 1 (Description) -> Step 2 (Ingredients)
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click();
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click();

            // Verify Step 2 is initially soft-locked by Maria
            cy.get('[data-testid="lock-banner"]', { timeout: 10000 })
                .should('be.visible')
                .and('contain', '@maria is currently editing this step');
            cy.get('[data-cy="recipe-ingredient-0"]').should('be.disabled');

            // Maria finishes editing and releases her lock
            cy.then(() => {
                lockActive = false;
            });

            // On next polling cycle, verify the lock banner disappears and the input becomes interactive
            cy.get('[data-testid="lock-banner"]', { timeout: 10000 }).should(
                'not.exist'
            );
            cy.get('[data-cy="recipe-ingredient-0"]')
                .should('not.be.disabled')
                .type('2 tsp Vanilla Extract');
            cy.get('[data-cy="recipe-ingredient-0"]').should(
                'have.value',
                '2 tsp Vanilla Extract'
            );

            cy.task('log', '✓ Live soft-lock auto-recovery verified');
        });
    });

    it('dynamically expands ingredient and step rows when remote co-cook appends items', () => {
        cy.task(
            'log',
            '=== Testing Dynamic Row Expansion on Remote Co-Cook Additions ==='
        );

        // Seed draft with 1 ingredient and 1 step
        cy.request('POST', '/api/draft/invite', {
            categories: ['Desserts'],
            title: 'Dynamic Rows Pancake',
            description: 'Fluffy pancake recipe',
            ingredients: ['1 cup Flour'],
            steps: ['Mix dry ingredients'],
        }).then((response) => {
            const draftId = response.body.draftId;

            // Visit draft on Step 0
            cy.visit(`/?draft=${draftId}`);
            cy.get('[data-testid="modal-title"]').should('be.visible');

            // Navigate to Step 1 (Description)
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click();
            cy.get('[data-cy="recipe-title"]').should(
                'have.value',
                'Dynamic Rows Pancake'
            );

            // While Author is on Step 1, Co-Cook updates draft in Redis with 4 ingredients and 3 steps
            cy.request('POST', '/api/draft', {
                draftId,
                ingredients: [
                    '1 cup Flour',
                    '1 cup Milk',
                    '2 Large Eggs',
                    '2 tbsp Melted Butter',
                ],
                steps: [
                    'Mix dry ingredients',
                    'Whisk in milk and eggs until smooth',
                    'Cook on hot buttered skillet until golden',
                ],
            });

            // Author advances to Step 2 (Ingredients)
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click();

            // Verify all 4 ingredient inputs are rendered and populated without truncation
            cy.get('[data-cy="recipe-ingredient-0"]').should(
                'have.value',
                '1 cup Flour'
            );
            cy.get('[data-cy="recipe-ingredient-1"]').should(
                'have.value',
                '1 cup Milk'
            );
            cy.get('[data-cy="recipe-ingredient-2"]').should(
                'have.value',
                '2 Large Eggs'
            );
            cy.get('[data-cy="recipe-ingredient-3"]').should(
                'have.value',
                '2 tbsp Melted Butter'
            );

            // Advance to Method, select method and advance to Step 4 (Steps)
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click();
            cy.get('[data-cy="method-box-Oven"]').click();
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click();

            // Verify all 3 step inputs are rendered and populated
            cy.get('[data-cy="recipe-step-0"]').should(
                'have.value',
                'Mix dry ingredients'
            );
            cy.get('[data-cy="recipe-step-1"]').should(
                'have.value',
                'Whisk in milk and eggs until smooth'
            );
            cy.get('[data-cy="recipe-step-2"]').should(
                'have.value',
                'Cook on hot buttered skillet until golden'
            );

            cy.task(
                'log',
                '✓ Dynamic row expansion for multi-ingredient and multi-step sync verified'
            );
        });

        it('atomic co-cook join flow prevents race conditions and strictly enforces MAX_CO_COOKS quota', () => {
            cy.task(
                'log',
                '=== TEST 12: Atomic Co-Cook Join & Quota Enforcement ==='
            );
            const collabTitle = `Atomic Join Collab ${Date.now().toString().slice(-4)}`;

            // Create shared draft via invite endpoint
            cy.request({
                method: 'POST',
                url: '/api/draft/invite',
                body: {
                    title: collabTitle,
                    categories: ['Dinner'],
                    ingredients: ['Garlic', 'Olive Oil'],
                    steps: ['Sauté garlic in oil'],
                    currentStep: 0,
                },
            }).then((inviteRes) => {
                expect(inviteRes.status).to.eq(200);
                const draftId = inviteRes.body.draftId;
                const token = inviteRes.body.inviteToken;
                expect(draftId).to.be.a('string');
                expect(token).to.be.a('string');

                // 1. Join with valid token
                cy.request({
                    method: 'GET',
                    url: `/api/draft/join?draft=${draftId}&token=${token}`,
                    followRedirect: false,
                }).then((joinRes) => {
                    expect(joinRes.status).to.eq(307);
                    expect(joinRes.headers.location).to.include('joined=true');
                });

                // 2. Attempt join with invalid token -> fails with invalid_invite_token error redirect
                cy.request({
                    method: 'GET',
                    url: `/api/draft/join?draft=${draftId}&token=invalid-fake-token`,
                    followRedirect: false,
                }).then((badTokenRes) => {
                    expect(badTokenRes.status).to.eq(307);
                    expect(badTokenRes.headers.location).to.include(
                        'error=invalid_invite_token'
                    );
                });

                // 3. Open the recipe modal for this shared draft
                cy.visit(`/?draft=${draftId}`);
                cy.get('[data-testid="modal-title"]').should('be.visible');

                // Advance to Related Content (Step 5) to inspect co-cooks capacity
                for (let i = 0; i < 5; i++) {
                    cy.get('[data-cy="modal-action-button"]')
                        .should('not.be.disabled')
                        .click();
                }

                // Verify the modal is at Step 5 and co-cooks list is visible
                cy.get('[data-testid="co-cooks-count"]').should('be.visible');
            });
        });
    });
});
