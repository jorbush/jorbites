describe('Recipe Lists E2E', () => {
    let testRecipeId = '';
    const testRecipeTitle = 'E2E Recipe for Lists';
    const customListName = 'E2E Weekend List';

    const cleanupResources = () => {
        // Clean up test custom lists
        cy.request({
            method: 'GET',
            url: '/api/lists',
            failOnStatusCode: false,
        }).then((res) => {
            if (Array.isArray(res.body)) {
                res.body.forEach(
                    (list: {
                        id: string;
                        name: string;
                        isDefault: boolean;
                    }) => {
                        if (
                            !list.isDefault &&
                            (list.name === customListName ||
                                list.name.includes('E2E'))
                        ) {
                            cy.request({
                                method: 'DELETE',
                                url: `/api/lists/${list.id}`,
                                failOnStatusCode: false,
                            });
                        }
                    }
                );
            }
        });

        // Clean up test recipe
        if (testRecipeId) {
            cy.request({
                method: 'DELETE',
                url: `/api/recipe/${testRecipeId}`,
                failOnStatusCode: false,
            });
            testRecipeId = '';
        }

        // Clean up any leftover recipes by search
        cy.request({
            method: 'GET',
            url: `/api/search?q=${encodeURIComponent(testRecipeTitle)}&type=recipes`,
            failOnStatusCode: false,
        }).then((res) => {
            if (res.body?.recipes && Array.isArray(res.body.recipes)) {
                res.body.recipes.forEach((r: { id: string }) => {
                    if (r?.id) {
                        cy.request({
                            method: 'DELETE',
                            url: `/api/recipe/${r.id}`,
                            failOnStatusCode: false,
                        });
                    }
                });
            }
        });
    };

    const ensureTestRecipe = () => {
        if (testRecipeId) return;

        const timestamp = Date.now();
        cy.request({
            method: 'POST',
            url: '/api/recipes',
            body: {
                title: testRecipeTitle,
                description:
                    'A delicious test recipe used to verify lists functionality in E2E tests.',
                categories: ['Salads'],
                ingredients: [
                    'Fresh spinach',
                    'Cherry tomatoes',
                    'Balsamic vinegar',
                ],
                steps: ['Wash the fresh vegetables', 'Toss gently in a bowl'],
                method: 'Raw',
                minutes: 10,
                calories: 180,
                imageSrc: `https://res.cloudinary.com/demo/image/upload/recipe-lists-${timestamp}.jpg`,
            },
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('id');
            testRecipeId = response.body.id;
        });
    };

    beforeEach(() => {
        cy.login();
        cleanupResources();
        ensureTestRecipe();
        cy.visit('/');
        cy.ensureEnglish();
    });

    after(() => {
        cleanupResources();
    });

    it('complete custom list lifecycle - create from recipe, view in /lists, toggle privacy, remove recipe, and delete', () => {
        cy.task(
            'log',
            '=== STEP 1: Navigate to recipe and open AddToList modal ==='
        );
        cy.visit(`/recipes/${testRecipeId}`);
        cy.get('[data-cy="recipe-title-display"]').should(
            'contain',
            testRecipeTitle
        );

        cy.get('[data-cy="add-to-list-button"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');

        cy.task(
            'log',
            '=== STEP 2: Create a new custom list with the recipe ==='
        );
        cy.get('[data-cy="create-new-list-button"]').click();
        cy.get('[data-cy="new-list-name-input"]').type(customListName);
        cy.get('[data-cy="submit-new-list-button"]').click();

        // Verify list is created and shows as selected in the modal
        cy.contains('[data-cy="list-item"]', customListName, {
            timeout: 10000,
        }).within(() => {
            cy.get('[data-cy="list-item-selected"]').should('be.visible');
        });
        cy.task('log', '✓ Custom list created and recipe selected');

        // Close the modal
        cy.get('[data-cy="modal-action-button"]').click();
        cy.get('[data-testid="modal-title"]').should('not.exist');

        cy.task(
            'log',
            '=== STEP 3: Navigate to /lists via User Menu and verify list ==='
        );
        cy.get('[data-cy="user-menu"]').click();
        cy.get('[data-cy="user-menu-lists"]').should('be.visible').click();
        cy.url().should('include', '/lists');

        // Verify My Lists tab displays the new list
        cy.get('[data-cy="tab-my"]').should('be.visible');
        cy.contains('[data-cy="list-card"]', customListName).should(
            'be.visible'
        );
        cy.contains('[data-cy="list-card"]', customListName).within(() => {
            cy.contains('1').should('exist'); // 1 recipe
        });
        cy.task('log', '✓ List appears on /lists with 1 recipe');

        // Verify Tab switching
        cy.get('[data-cy="tab-community"]').click();
        cy.get('[data-cy="tab-community"]').should(
            'not.have.class',
            'border-transparent'
        );
        cy.get('[data-cy="tab-my"]').click();
        cy.get('[data-cy="tab-my"]').should(
            'not.have.class',
            'border-transparent'
        );

        cy.task(
            'log',
            '=== STEP 4: Open list detail view and verify contents ==='
        );
        cy.get('[data-cy="list-card-title"]').contains(customListName).click();
        cy.url().should('include', '/lists/');
        cy.get('[data-cy="list-title"]').should('contain', customListName);
        cy.get('[data-cy="recipe-card"]').should('have.length.at.least', 1);
        cy.task('log', '✓ List detail view loaded with recipe card');

        cy.task('log', '=== STEP 5: Toggle list privacy ===');
        cy.get('[data-cy="toggle-list-privacy"]').click();
        cy.get('[data-cy="share-list-button"]', { timeout: 10000 }).should(
            'be.visible'
        );
        cy.task('log', '✓ List is now public, share button visible');

        cy.get('[data-cy="toggle-list-privacy"]').click();
        cy.get('[data-cy="share-list-button"]').should('not.exist');
        cy.task('log', '✓ List is now private again');

        cy.task('log', '=== STEP 6: Remove recipe from list ===');
        cy.get('[data-cy="recipe-card-action-button"]').first().click();
        cy.get('[data-cy="recipe-card"]').should('not.exist');
        cy.task('log', '✓ Recipe removed from list');

        cy.task('log', '=== STEP 7: Delete custom list ===');
        cy.intercept('DELETE', '/api/lists/*').as('deleteList');
        cy.get('[data-cy="delete-list-button"]').click({ force: true });
        cy.get('[data-testid="modal-title"]').should('be.visible');
        cy.get('[data-cy="modal-action-button"]').click({ force: true });
        cy.wait('@deleteList');
        cy.url().should('include', '/lists');
        cy.contains('[data-cy="list-card"]', customListName).should(
            'not.exist'
        );
        cy.task('log', '✅ Custom list lifecycle completed successfully');
    });

    it('validates default list protections - cannot be deleted', () => {
        cy.task(
            'log',
            '=== Verifying default "To cook later" list cannot be deleted ==='
        );
        cy.visit('/lists');
        cy.get('[data-cy="tab-my"]').should('be.visible');

        // Verify default list card does not display a delete button
        cy.contains('[data-cy="list-card"]', /cook later|cocinar/i)
            .should('be.visible')
            .within(() => {
                cy.get('[data-cy="delete-list-button"]').should('not.exist');
            });

        // Click into default list
        cy.contains(
            '[data-cy="list-card-title"]',
            /cook later|cocinar/i
        ).click();
        cy.url().should('include', '/lists/');

        // On list detail page, delete button should not exist
        cy.get('[data-cy="list-title"]').should('be.visible');
        cy.get('[data-cy="delete-list-button"]').should('not.exist');
        cy.task(
            'log',
            '✓ Verified default list has no delete button on detail page'
        );
    });
});
