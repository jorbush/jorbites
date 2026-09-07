describe('Meal Plannings E2E', () => {
    let testRecipeId = '';
    let testPlanId = '';
    const testRecipeTitle = 'E2E Recipe for Planning';
    const initialPlanName = 'E2E Test Diet Plan';
    const updatedPlanName = 'Updated E2E Diet Plan';

    const cleanupResources = () => {
        // Clean up test planning by tracked ID
        if (testPlanId) {
            cy.request({
                method: 'DELETE',
                url: `/api/plannings/${testPlanId}`,
                failOnStatusCode: false,
            });
            testPlanId = '';
        }

        // Clean up any public leftover test plannings
        cy.request({
            method: 'GET',
            url: '/api/plannings',
            failOnStatusCode: false,
        }).then((res) => {
            if (Array.isArray(res.body)) {
                res.body.forEach((plan: { id: string; name: string }) => {
                    if (
                        plan.name === initialPlanName ||
                        plan.name === updatedPlanName ||
                        plan.name.includes('E2E')
                    ) {
                        cy.request({
                            method: 'DELETE',
                            url: `/api/plannings/${plan.id}`,
                            failOnStatusCode: false,
                        });
                    }
                });
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
                    'A nutritious recipe for testing meal planner diet grids and slot management.',
                categories: ['Vegetarian'],
                ingredients: [
                    'Quinoa',
                    'Roasted chickpeas',
                    'Avocado',
                    'Lemon dressing',
                ],
                steps: [
                    'Cook quinoa according to package',
                    'Toss with chickpeas, sliced avocado, and dressing',
                ],
                method: 'Boiled',
                minutes: 20,
                calories: 420,
                imageSrc: `https://res.cloudinary.com/demo/image/upload/recipe-plannings-${timestamp}.jpg`,
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
        cy.visit('/plannings');
        cy.ensureEnglish();
    });

    after(() => {
        cleanupResources();
    });

    it('complete meal plan lifecycle - create, add/remove meals, shopping list, export calendar, edit, and delete', () => {
        cy.task('log', '=== STEP 1: Create a new meal plan ===');
        cy.get('[data-cy="create-meal-plan-button"]')
            .should('be.visible')
            .click();

        cy.get('[data-cy="plan-name-input"]').type(initialPlanName);
        cy.get('[data-cy="plan-description-textarea"]').type(
            'Weekly healthy meal plan for testing'
        );
        cy.get('[data-cy="modal-action-button"]').click();

        // Redirect to detail page
        cy.url()
            .should('include', '/plannings/')
            .then((url) => {
                const parts = url.split('/plannings/');
                if (parts[1]) {
                    testPlanId = parts[1].split('?')[0];
                }
            });
        cy.task('log', '✓ Redirected to meal plan detail page');

        cy.task(
            'log',
            '=== STEP 2: Verify plan detail page header and week grid ==='
        );
        cy.get('[data-cy="plan-title"]').should('contain', initialPlanName);
        cy.get('[data-cy="plan-description"]').should(
            'contain',
            'Weekly healthy meal plan for testing'
        );

        // Verify day cards are rendered
        cy.contains('h3', 'monday', { matchCase: false }).should('be.visible');
        cy.contains('h3', 'sunday', { matchCase: false }).should('be.visible');
        cy.task('log', '✓ Plan header and 7-day grid verified');

        cy.task('log', '=== STEP 3: Add recipe to Monday meal slot ===');
        cy.intercept('GET', '/api/search*').as('searchRecipes');
        cy.get('[data-cy="add-recipe-button"]').first().click();

        // Recipe selection modal
        cy.get('[data-cy="recipe-select-search-input"]')
            .should('be.visible')
            .type(testRecipeTitle);

        cy.wait('@searchRecipes');

        cy.get('[data-cy="recipe-select-option"]', { timeout: 10000 })
            .should('be.visible')
            .first()
            .click();

        // Verify recipe now appears in the slot
        cy.get('[data-cy="slot-recipe-title"]', { timeout: 10000 }).should(
            'contain',
            testRecipeTitle
        );
        cy.task('log', '✓ Recipe scheduled in meal slot');

        cy.task('log', '=== STEP 4: Test Shopping List Modal ===');
        cy.get('[data-cy="shopping-list-button"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');
        cy.contains('Quinoa').should('exist');
        cy.get('[data-testid="close-modal-button"]').click();
        cy.get('[data-testid="modal-title"]').should('not.exist');
        cy.task('log', '✓ Shopping list modal verified');

        cy.task('log', '=== STEP 5: Test Export Calendar Modal ===');
        cy.get('[data-cy="export-calendar-button"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');
        cy.get('[data-testid="close-modal-button"]').click();
        cy.get('[data-testid="modal-title"]').should('not.exist');
        cy.task('log', '✓ Export calendar modal verified');

        cy.task('log', '=== STEP 6: Remove recipe from meal slot ===');
        cy.get('[data-cy="remove-meal-recipe-button"]')
            .first()
            .click({ force: true });
        cy.get('[data-cy="slot-recipe-title"]').should('not.exist');
        cy.task('log', '✓ Recipe removed from slot');

        cy.task('log', '=== STEP 7: Edit meal plan metadata ===');
        cy.get('[data-cy="edit-plan-button"]').click();
        cy.get('[data-cy="plan-name-input"]').clear().type(updatedPlanName);
        cy.get('[data-cy="plan-description-textarea"]')
            .clear()
            .type('Updated description for E2E testing');
        cy.get('[data-cy="modal-action-button"]').click();

        cy.get('[data-cy="plan-title"]').should('contain', updatedPlanName);
        cy.get('[data-cy="plan-description"]').should(
            'contain',
            'Updated description for E2E testing'
        );
        cy.task('log', '✓ Meal plan metadata updated');

        cy.task('log', '=== STEP 8: Toggle privacy ===');
        cy.get('[data-cy="toggle-plan-privacy"]').click();
        cy.get('[data-testid="lock-open-icon"]', { timeout: 10000 }).should(
            'be.visible'
        );
        cy.get('[data-cy="toggle-plan-privacy"]').click();
        cy.get('[data-testid="lock-icon"]', { timeout: 10000 }).should(
            'be.visible'
        );
        cy.task('log', '✓ Privacy toggle verified');

        cy.task(
            'log',
            '=== STEP 9: Navigate back to /plannings and verify card in tab ==='
        );
        cy.visit('/plannings');
        cy.get('[data-cy="tab-my"]').should('be.visible');
        cy.contains('[data-cy="planning-card"]', updatedPlanName).should(
            'be.visible'
        );

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

        cy.task('log', '=== STEP 10: Delete meal plan ===');
        cy.intercept('DELETE', '/api/plannings/*').as('deletePlan');
        cy.contains('[data-cy="planning-card"]', updatedPlanName).within(() => {
            cy.get('[data-cy="delete-planning-button"]').click({ force: true });
        });
        cy.get('[data-testid="modal-title"]').should('be.visible');
        cy.get('[data-cy="modal-action-button"]').click({ force: true });
        cy.wait('@deletePlan');
        testPlanId = '';
        cy.get('[data-testid="modal-title"]').should('not.exist');
        cy.contains('[data-cy="planning-card"]', updatedPlanName).should(
            'not.exist'
        );
        cy.task('log', '✅ Meal plan lifecycle completed successfully');
    });
});
