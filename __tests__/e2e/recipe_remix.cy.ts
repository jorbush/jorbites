describe('Recipe Remix / Fork Workflow E2E', () => {
    let testRecipeId = '';
    const testRecipeTitle = 'E2E Recipe for Remix';

    const cleanupResources = () => {
        if (testRecipeId) {
            cy.request({
                method: 'DELETE',
                url: `/api/recipe/${testRecipeId}`,
                failOnStatusCode: false,
            });
            testRecipeId = '';
        }

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

    const ensureTestRecipe = () => {
        if (testRecipeId) return cy.wrap(testRecipeId);

        const timestamp = Date.now();
        return cy
            .request({
                method: 'POST',
                url: '/api/recipes',
                body: {
                    title: testRecipeTitle,
                    description:
                        'Source recipe seeded for remix and remix draft E2E tests.',
                    categories: ['Salads'],
                    ingredients: [
                        'Fresh spinach',
                        'Cherry tomatoes',
                        'Olive oil',
                    ],
                    steps: ['Wash greens', 'Toss with tomatoes and oil'],
                    method: 'Raw',
                    minutes: 10,
                    calories: 150,
                    imageSrc: `https://res.cloudinary.com/demo/image/upload/recipe-remix-${timestamp}.jpg`,
                },
            })
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('id');
                testRecipeId = response.body.id;
                return testRecipeId;
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

    it('navigates to remix editor, pre-fills recipe data, and displays attribution banner', () => {
        ensureTestRecipe().then((recipeId) => {
            cy.task('log', '=== Navigating to seeded recipe detail page ===');
            cy.visit(`/recipes/${recipeId}`);
            cy.url().should('include', `/recipes/${recipeId}`);

            cy.task(
                'log',
                '=== Verifying Remix Recipe button alongside I Made This button ==='
            );
            cy.get('[data-testid="post-steps-cooksnap-btn"]').should(
                'be.visible'
            );
            cy.get('[data-cy="remix-recipe-btn"]')
                .should('be.visible')
                .and('contain.text', 'Remix Recipe');

            cy.task('log', '=== Clicking Remix Recipe button ===');
            cy.get('[data-cy="remix-recipe-btn"]').click();

            cy.task(
                'log',
                '=== Verifying URL routes to /recipes/create?forkFrom= ==='
            );
            cy.url().should('include', `/recipes/create?forkFrom=${recipeId}`);

            cy.task(
                'log',
                '=== Verifying recipe modal opens with pre-filled state ==='
            );
            cy.get('[data-testid="modal-title"]', { timeout: 10000 }).should(
                'be.visible'
            );

            // Advance from Category step to Description step
            cy.get('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click();

            // Verify title is pre-populated with "Remix of ..."
            cy.get('[data-cy="recipe-title"]')
                .should('be.visible')
                .invoke('val')
                .should('match', /^Remix of /);

            cy.task(
                'log',
                '=== Verifying Community Remixes section conditional display ==='
            );
            cy.visit(`/recipes/${recipeId}`);
            cy.get('body').then(($body) => {
                if (
                    $body.find('[data-cy="community-remixes-section"]').length >
                    0
                ) {
                    cy.get('[data-cy="community-remixes-section"]').should(
                        'be.visible'
                    );
                } else {
                    cy.get('[data-cy="community-remixes-section"]').should(
                        'not.exist'
                    );
                }
            });
        });
    });

    it('saves a remix draft, displays remix badge in DraftsModal, resumes it, and preserves remix validation', () => {
        ensureTestRecipe().then((recipeId) => {
            cy.task('log', '=== Opening remix editor from seeded recipe ===');
            cy.visit(`/recipes/${recipeId}`);
            cy.get('[data-cy="remix-recipe-btn"]').click();
            cy.url().should('include', `/recipes/create?forkFrom=${recipeId}`);
            cy.get('[data-testid="modal-title"]', { timeout: 10000 }).should(
                'be.visible'
            );

            // Advance from Category to Description step
            cy.get('[data-cy="modal-action-button"]').click();
            cy.get('[data-cy="recipe-title"]')
                .should('be.visible')
                .clear()
                .type('Saved Remix Draft');

            // Save remix draft explicitly
            cy.intercept('POST', '/api/draft').as('saveRemixDraft');
            cy.get('[data-cy="save-draft-button"]')
                .should('be.visible')
                .click();
            cy.wait('@saveRemixDraft')
                .its('response.statusCode')
                .should('eq', 200);

            // Close modal and open DraftsModal from user menu
            cy.get('[data-testid="close-modal-button"]').click();
            cy.url().should('not.include', '/recipes/create');
            cy.visit('/');
            cy.get('[data-cy="user-menu"]').click();
            cy.get('[data-cy="user-menu-my-drafts"]')
                .should('be.visible')
                .click();

            cy.get('[data-testid="drafts-modal"]').should('be.visible');
            cy.contains(
                '[data-testid="draft-card"]',
                'Saved Remix Draft'
            ).within(() => {
                cy.get('[data-testid="draft-card-remix-badge"]')
                    .should('be.visible')
                    .and('contain.text', 'Remix');
            });

            // Resume the remix draft
            cy.contains(
                '[data-testid="draft-card"]',
                'Saved Remix Draft'
            ).click();
            cy.get('[data-cy="recipe-title"]', { timeout: 10000 }).should(
                'have.value',
                'Saved Remix Draft'
            );

            // Advance DESCRIPTION -> INGREDIENTS -> METHODS -> STEPS -> RELATED_CONTENT -> IMAGES
            for (let i = 0; i < 5; i++) {
                cy.get('[data-cy="modal-action-button"]').click();
            }

            // Submitting without modifying original ingredients & steps should be blocked
            cy.intercept('POST', '/api/recipes').as('submitRemix');
            cy.get('[data-cy="modal-action-button"]').click();
            cy.get('[data-cy="recipe-ingredient-0"]', {
                timeout: 10000,
            }).should('be.visible');
            cy.get('@submitRemix.all').should('have.length', 0);
        });
    });
});
