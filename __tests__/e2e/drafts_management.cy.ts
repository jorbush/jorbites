describe('Drafts Management & Multi-Draft E2E', () => {
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

        // Clean up any leftover test recipes
        ['Solo Published Omelette'].forEach((query) => {
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

    it('deleting all drafts completely cleans up state so opening RecipeModal after refresh starts with a clean empty form', () => {
        // Step 1: Create Draft A
        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');
        cy.get('[data-cy="category-box-Desserts"]').click();
        cy.get('[data-cy="modal-action-button"]').click();
        cy.get('[data-cy="recipe-title"]').type('Draft A Pavlova');
        cy.get('[data-cy="recipe-description"]').type('Delicious dessert');
        cy.intercept('POST', '/api/draft').as('saveDraftA');
        cy.get('[data-testid="load-draft-button"]').click();
        cy.wait('@saveDraftA');
        cy.get('[data-testid="close-modal-button"]').click();

        // Step 2: Open DraftsModal and duplicate to have multiple drafts
        cy.get('[data-cy="user-menu"]').click();
        cy.get('[data-cy="user-menu-my-drafts"]').should('be.visible').click();
        cy.get('[data-testid="drafts-modal"]').should('be.visible');
        cy.get('[data-testid="draft-card"]').should('have.length', 1);

        cy.intercept('POST', '/api/draft').as('duplicateDraft');
        cy.get('[data-testid="draft-card-duplicate"]').first().click();
        cy.wait('@duplicateDraft');
        cy.get('[data-testid="draft-card"]').should('have.length', 2);

        // Step 3: Delete first draft
        cy.intercept('DELETE', '/api/draft*').as('deleteFirst');
        cy.get('[data-testid="draft-card-delete"]').first().click();
        cy.get('[data-testid="draft-delete-confirm-btn"]').click();
        cy.wait('@deleteFirst');
        cy.get('[data-testid="draft-card"]').should('have.length', 1);

        // Step 4: Delete second (last) draft
        cy.intercept('DELETE', '/api/draft*').as('deleteLast');
        cy.get('[data-testid="draft-card-delete"]').first().click();
        cy.get('[data-testid="draft-delete-confirm-btn"]').click();
        cy.wait('@deleteLast');

        // Step 5: Verify empty state in DraftsModal
        cy.get('[data-testid="drafts-modal-empty-state"]').should('be.visible');
        cy.get('[data-testid="close-modal-button"]').click();

        // Step 6: Reload the page
        cy.reload();
        cy.ensureEnglish();

        // Step 7: Open RecipeModal afresh -> should be completely clean (no ghost draft)
        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');
        cy.get('[data-testid="drafts-indicator-dot"]').should('not.exist');
        cy.contains('(0/3)').should('be.visible');
        cy.get('.selected').should('not.exist');

        // Advance to step 1 and verify fields are blank
        cy.get('[data-cy="category-box-Desserts"]').click();
        cy.get('[data-cy="modal-action-button"]').click();
        cy.get('[data-cy="recipe-title"]').should('have.value', '');
        cy.get('[data-cy="recipe-description"]').should('have.value', '');
    });

    it('saves full recipe state (including ingredients and steps) when saving draft from later steps, and restores all fields upon reload', () => {
        // Step 1: Open RecipeModal
        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');

        // Step 0: Category
        cy.get('[data-cy="category-box-Desserts"]').click();
        cy.get('[data-cy="modal-action-button"]').click();

        // Step 1: Description
        cy.get('[data-cy="recipe-title"]').type('Cheesecake Special');
        cy.get('[data-cy="recipe-description"]').type(
            'Rich strawberry baked cake'
        );
        cy.get('[data-cy="modal-action-button"]').click();

        // Step 2: Ingredients
        cy.get('[data-cy="recipe-ingredient-0"]').type('500g Cream Cheese');
        cy.get('[data-cy="add-ingredient-button"]').click();
        cy.get('[data-cy="recipe-ingredient-1"]').type(
            '200g Fresh Strawberries'
        );
        cy.get('[data-cy="add-ingredient-button"]').click();
        cy.get('[data-cy="recipe-ingredient-2"]').type('150g Graham Crackers');
        cy.get('[data-cy="modal-action-button"]').click();

        // Step 3: Methods
        cy.get('[data-cy="method-box-Oven"]').click();
        cy.get('[data-cy="modal-action-button"]').click();

        // Step 4: Steps
        cy.get('[data-cy="recipe-step-0"]').type(
            'Crush crackers and press into pan'
        );
        cy.get('[data-cy="add-step-button"]').click();
        cy.get('[data-cy="recipe-step-1"]').type(
            'Mix cream cheese and bake at 160C for 45 mins'
        );
        cy.get('[data-cy="modal-action-button"]').click();

        // Step 5: Related Content - Save Draft from here (a later step!)
        cy.intercept('POST', '/api/draft').as('saveDraftLaterStep');
        cy.get('[data-testid="load-draft-button"]').click();
        cy.wait('@saveDraftLaterStep').then((interception) => {
            expect(interception.request.body.ingredients).to.deep.equal([
                '500g Cream Cheese',
                '200g Fresh Strawberries',
                '150g Graham Crackers',
            ]);
            expect(interception.request.body.steps).to.deep.equal([
                'Crush crackers and press into pan',
                'Mix cream cheese and bake at 160C for 45 mins',
            ]);
            expect(interception.request.body.title).to.equal(
                'Cheesecake Special'
            );
            expect(interception.request.body.method).to.equal('Oven');
        });

        // Close RecipeModal
        cy.get('[data-testid="close-modal-button"]').click();

        // Reload page to verify persistence from Redis
        cy.reload();
        cy.ensureEnglish();

        // Re-open RecipeModal -> should auto-load draft
        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');
        cy.get('[data-testid="drafts-indicator-dot"]').should('be.visible');

        // Navigate back step-by-step and verify all inputs are restored
        // Back to Step 4: Steps
        cy.get('[data-cy="secondary-action-button"]').click();
        cy.get('[data-cy="recipe-step-0"]').should(
            'have.value',
            'Crush crackers and press into pan'
        );
        cy.get('[data-cy="recipe-step-1"]').should(
            'have.value',
            'Mix cream cheese and bake at 160C for 45 mins'
        );

        // Back to Step 3: Methods
        cy.get('[data-cy="secondary-action-button"]').click();
        cy.get('[data-cy="method-box-Oven"]').should('have.class', 'selected');

        // Back to Step 2: Ingredients
        cy.get('[data-cy="secondary-action-button"]').click();
        cy.get('[data-cy="recipe-ingredient-0"]').should(
            'have.value',
            '500g Cream Cheese'
        );
        cy.get('[data-cy="recipe-ingredient-1"]').should(
            'have.value',
            '200g Fresh Strawberries'
        );
        cy.get('[data-cy="recipe-ingredient-2"]').should(
            'have.value',
            '150g Graham Crackers'
        );

        // Back to Step 1: Description
        cy.get('[data-cy="secondary-action-button"]').click();
        cy.get('[data-cy="recipe-title"]').should(
            'have.value',
            'Cheesecake Special'
        );
        cy.get('[data-cy="recipe-description"]').should(
            'have.value',
            'Rich strawberry baked cake'
        );
    });

    it('switches between distinct drafts in DraftsModal without form state leakage', () => {
        // Step 1: Create Draft A (Strawberry Tart)
        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');
        cy.get('[data-cy="category-box-Desserts"]').click();
        cy.get('[data-cy="modal-action-button"]').click();

        cy.get('[data-cy="recipe-title"]').type('Strawberry Tart Draft');
        cy.get('[data-cy="recipe-description"]').type(
            'Fresh berries with cream'
        );
        cy.get('[data-cy="modal-action-button"]').click();

        cy.get('[data-cy="recipe-ingredient-0"]').type('500g Strawberries');
        cy.get('[data-cy="add-ingredient-button"]').click();
        cy.get('[data-cy="recipe-ingredient-1"]').type('200g Pastry Crust');
        cy.get('[data-cy="modal-action-button"]').click();

        cy.get('[data-cy="method-box-Oven"]').click();
        cy.get('[data-cy="modal-action-button"]').click();

        cy.get('[data-cy="recipe-step-0"]').type('Bake crust for 20 mins');
        cy.intercept('POST', '/api/draft').as('saveDraftA');
        cy.get('[data-testid="load-draft-button"]').click();
        cy.wait('@saveDraftA');
        cy.get('[data-testid="close-modal-button"]').click();

        // Step 2: Open DraftsModal and create Draft B (Garlic Bread)
        cy.get('[data-cy="user-menu"]').click();
        cy.get('[data-cy="user-menu-my-drafts"]').should('be.visible').click();
        cy.get('[data-testid="drafts-modal"]').should('be.visible');
        cy.get('[data-testid="draft-card"]').should('have.length', 1);

        cy.get('[data-cy="modal-action-button"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');

        // Draft B: Vegetarian Category
        cy.get('[data-cy="category-box-Vegetarian"]').click();
        cy.get('[data-cy="modal-action-button"]').click();

        // Draft B: Description
        cy.get('[data-cy="recipe-title"]').type('Garlic Bread Draft');
        cy.get('[data-cy="recipe-description"]').type(
            'Crispy toasted baguette'
        );
        cy.get('[data-cy="modal-action-button"]').click();

        // Draft B: Ingredients
        cy.get('[data-cy="recipe-ingredient-0"]').type('1 Baguette');
        cy.get('[data-cy="add-ingredient-button"]').click();
        cy.get('[data-cy="recipe-ingredient-1"]').type('4 Cloves Garlic');

        cy.intercept('POST', '/api/draft').as('saveDraftB');
        cy.get('[data-testid="load-draft-button"]').click();
        cy.wait('@saveDraftB');

        // Step 3: Switch from Draft B to Draft A via in-modal Drafts button
        cy.get('[data-testid="open-drafts-modal-button"]').click();
        cy.get('[data-testid="drafts-modal"]').should('be.visible');
        cy.get('[data-testid="draft-card"]').should('have.length', 2);

        // Click Draft A card
        cy.contains(
            '[data-testid="draft-card"]',
            'Strawberry Tart Draft'
        ).click();
        cy.get('[data-testid="modal-title"]').should('be.visible');
        cy.get('[data-testid="drafts-indicator-dot"]').should('be.visible');

        // Verify Draft A's ingredients and title
        cy.get('[data-cy="secondary-action-button"]').click(); // to Step 3
        cy.get('[data-cy="secondary-action-button"]').click(); // to Step 2
        cy.get('[data-cy="recipe-ingredient-0"]').should(
            'have.value',
            '500g Strawberries'
        );
        cy.get('[data-cy="recipe-ingredient-1"]').should(
            'have.value',
            '200g Pastry Crust'
        );

        cy.get('[data-cy="secondary-action-button"]').click(); // to Step 1
        cy.get('[data-cy="recipe-title"]').should(
            'have.value',
            'Strawberry Tart Draft'
        );

        // Step 4: Switch back from Draft A to Draft B
        cy.get('[data-testid="open-drafts-modal-button"]').click();
        cy.get('[data-testid="drafts-modal"]').should('be.visible');
        cy.contains('[data-testid="draft-card"]', 'Garlic Bread Draft').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');

        cy.get('[data-cy="secondary-action-button"]').click(); // to Step 1
        cy.get('[data-cy="recipe-title"]').should(
            'have.value',
            'Garlic Bread Draft'
        );
        cy.get('[data-cy="recipe-description"]').should(
            'have.value',
            'Crispy toasted baguette'
        );

        cy.get('[data-cy="modal-action-button"]').click(); // to Step 2
        cy.get('[data-cy="recipe-ingredient-0"]').should(
            'have.value',
            '1 Baguette'
        );
        cy.get('[data-cy="recipe-ingredient-1"]').should(
            'have.value',
            '4 Cloves Garlic'
        );
    });

    it('cleans up solo draft completely upon publishing recipe', () => {
        const recipeName = 'Solo Published Omelette';

        // Step 1: Open RecipeModal and create a draft
        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');

        // Step 0: Category
        cy.get('[data-cy="category-box-Snacks"]').click();
        cy.get('[data-cy="modal-action-button"]').click();

        // Step 1: Description
        cy.get('[data-cy="recipe-title"]').type(recipeName);
        cy.get('[data-cy="recipe-description"]').type('Fluffy cheese omelette');
        cy.get('[data-cy="modal-action-button"]').click();

        // Step 2: Ingredients
        cy.get('[data-cy="recipe-ingredient-0"]').type('3 Large Eggs');
        cy.get('[data-cy="add-ingredient-button"]').click();
        cy.get('[data-cy="recipe-ingredient-1"]').type('50g Cheddar Cheese');
        cy.get('[data-cy="modal-action-button"]').click();

        // Step 3: Methods
        cy.get('[data-cy="method-box-Frying pan"]').click();
        cy.get('[data-cy="modal-action-button"]').click();

        // Step 4: Steps
        cy.get('[data-cy="recipe-step-0"]').type('Whisk eggs and fry in pan');
        cy.get('[data-cy="modal-action-button"]').click();

        // Step 5: Related Content
        cy.intercept('POST', '/api/draft').as('saveDraft');
        cy.get('[data-testid="load-draft-button"]').click();
        cy.wait('@saveDraft');
        cy.get('[data-cy="modal-action-button"]').click();

        // Step 6: Images & Publish
        cy.intercept('POST', '/api/recipes').as('publishRecipe');
        cy.get('[data-cy="modal-action-button"]').click();

        cy.wait('@publishRecipe').then((interception) => {
            expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
            if (interception.response?.body?.id) {
                createdRecipeIds.push(interception.response.body.id);
            }
        });

        cy.get('[class^="go"]', { timeout: 10000 }).should('be.visible');
        cy.wait(1000);

        // Recipe card should appear in feed
        cy.get('[data-cy="recipe-card-title"]', { timeout: 10000 })
            .contains(recipeName)
            .should('be.visible');

        // Step 2: Open RecipeModal again -> should be fresh and empty
        cy.get('[data-cy="post-recipe"]').should('be.visible').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');
        cy.get('[data-cy^="category-box-"]').first().should('be.visible');
        cy.get('[data-testid="drafts-indicator-dot"]').should('not.exist');
        cy.contains('(0/3)').should('be.visible');
        cy.get('[data-testid="close-modal-button"]').click();

        // Step 3: Open DraftsModal -> should show empty state
        cy.get('[data-cy="user-menu"]').click();
        cy.get('[data-cy="user-menu-my-drafts"]').should('be.visible').click();
        cy.get('[data-testid="drafts-modal"]').should('be.visible');
        cy.get('[data-testid="drafts-modal-empty-state"]').should('be.visible');
    });

    it('enforces max solo drafts limit of 5 slots and rejects further creations', () => {
        // Create initial draft
        cy.request({
            method: 'POST',
            url: '/api/draft',
            body: {
                title: 'Draft Slot 1',
                categories: ['Snacks'],
                updatedAt: new Date().toISOString(),
            },
        });

        // Open DraftsModal via UserMenu
        cy.get('[data-cy="user-menu"]').click();
        cy.get('[data-cy="user-menu-my-drafts"]').should('be.visible').click();
        cy.get('[data-testid="drafts-modal"]').should('be.visible');
        cy.get('[data-testid="draft-card"]').should('have.length', 1);

        // Duplicate up to 5 drafts
        for (let i = 2; i <= 5; i++) {
            cy.intercept('POST', '/api/draft').as(`dup${i}`);
            cy.get('[data-testid="draft-card-duplicate"]').first().click();
            cy.wait(`@dup${i}`);
            cy.get('[data-testid="draft-card"]').should('have.length', i);
        }

        // Attempt 6th duplicate -> should be rejected by server with 409 Conflict
        cy.intercept('POST', '/api/draft').as('dupExcess');
        cy.get('[data-testid="draft-card-duplicate"]').first().click();
        cy.wait('@dupExcess').then((interception) => {
            expect(interception.response?.statusCode).to.equal(409);
            expect(interception.response?.body?.error).to.equal(
                'MAX_SOLO_DRAFTS_REACHED'
            );
        });

        // Still exactly 5 cards
        cy.get('[data-testid="draft-card"]').should('have.length', 5);

        // Delete 1 draft -> count becomes 4
        cy.intercept('DELETE', '/api/draft*').as('deleteForSpace');
        cy.get('[data-testid="draft-card-delete"]').first().click();
        cy.get('[data-testid="draft-delete-confirm-btn"]').click();
        cy.wait('@deleteForSpace');
        cy.get('[data-testid="draft-card"]').should('have.length', 4);

        // Duplicating now succeeds again -> back to 5
        cy.intercept('POST', '/api/draft').as('dupSlotAvailable');
        cy.get('[data-testid="draft-card-duplicate"]').first().click();
        cy.wait('@dupSlotAvailable');
        cy.get('[data-testid="draft-card"]').should('have.length', 5);
    });

    it('displays mixed solo and collaborative drafts with respective badges, TTLs, and avatars in DraftsModal', () => {
        // Step 1: Create a Solo Draft via RecipeModal
        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');

        cy.get('[data-cy="category-box-Pasta"]').click();
        cy.get('[data-cy="modal-action-button"]').click();

        cy.get('[data-cy="recipe-title"]').type('Solo Truffle Pasta');
        cy.intercept('POST', '/api/draft').as('saveSoloDraft');
        cy.get('[data-testid="load-draft-button"]').click();
        cy.wait('@saveSoloDraft');

        // Step 2: Open DraftsModal and duplicate to create a second draft
        cy.intercept('POST', '/api/draft').as('dupDraft');
        cy.get('[data-testid="open-drafts-modal-button"]').click();
        cy.get('[data-testid="drafts-modal"]').should('be.visible');
        cy.get('[data-testid="draft-card"]').should('have.length', 1);

        cy.get('[data-testid="draft-card-duplicate"]').first().click();
        cy.wait('@dupDraft');
        cy.get('[data-testid="draft-card"]').should('have.length', 2);

        // Step 3: Convert the first draft into a Shared Collaborative Draft via share button
        cy.intercept('POST', '/api/draft/invite').as('generateInvite');
        cy.get('[data-testid="draft-card-share"]').first().click();
        cy.wait('@generateInvite');

        // Verify toast
        cy.contains('Co-cook invite link copied to clipboard').should(
            'be.visible'
        );

        // Step 4: Verify DraftsModal displays mixed badges
        // One card has "Shared" badge and 7d TTL, other card has "Solo" badge and 365d TTL
        cy.get('[data-testid="draft-card"]')
            .contains('Shared')
            .should('be.visible');
        cy.get('[data-testid="draft-card"]')
            .contains('Solo')
            .should('be.visible');

        // Verify TTL badges (1 week for 7-day shared draft, 52 weeks for 365-day solo draft)
        cy.get('[data-testid="draft-ttl-badge"]')
            .contains('1 week')
            .should('be.visible');
        cy.get('[data-testid="draft-ttl-badge"]')
            .contains('52 weeks')
            .should('be.visible');

        // Step 5: Open a draft from the mixed grid
        cy.get('[data-testid="draft-card-title"]').first().click();
        cy.get('[data-testid="modal-title"]').should('be.visible');
        cy.get('[data-cy="recipe-title"]').should(
            'contain.value',
            'Solo Truffle Pasta'
        );

        // Close RecipeModal
        cy.get('[data-testid="close-modal-button"]').click();
    });

    it('persists plain-text parsed ingredients and steps across draft save and full page reload', () => {
        const recipeName = 'Choco Lava Cake';

        // Step 1: Open RecipeModal and fill Category & Title
        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');

        cy.get('[data-cy="category-box-Desserts"]').click();
        cy.get('[data-cy="modal-action-button"]').click();

        cy.get('[data-cy="recipe-title"]').type(recipeName);
        cy.get('[data-cy="recipe-description"]').type(
            'Rich chocolate fondant with molten core'
        );
        cy.get('[data-cy="modal-action-button"]').click();

        // Step 2: On Ingredients step, toggle plain-text mode and apply multi-line text
        cy.get('[data-cy="toggle-input-mode"]').click();
        cy.get('[data-cy="ingredients-textarea"]').should('be.visible');
        cy.get('[data-cy="ingredients-textarea"]').type(
            '1. 200g Dark Chocolate\n2. 100g Butter\n3. 2 Eggs\n4. 50g Sugar'
        );
        cy.get('[data-cy="apply-ingredients-button"]').click();

        // Verify mode switched back to list mode with all 4 items
        cy.get('[data-cy="recipe-ingredient-0"]').should(
            'have.value',
            '200g Dark Chocolate'
        );
        cy.get('[data-cy="recipe-ingredient-1"]').should(
            'have.value',
            '100g Butter'
        );
        cy.get('[data-cy="recipe-ingredient-2"]').should(
            'have.value',
            '2 Eggs'
        );
        cy.get('[data-cy="recipe-ingredient-3"]').should(
            'have.value',
            '50g Sugar'
        );
        cy.get('[data-cy="modal-action-button"]').click();

        // Step 3: On Methods step, select Oven
        cy.get('[data-cy="method-box-Oven"]').click();
        cy.get('[data-cy="modal-action-button"]').click();

        // Step 4: On Steps step, toggle plain-text mode and apply multi-line steps
        cy.get('[data-cy="toggle-input-mode"]').click();
        cy.get('[data-cy="steps-textarea"]').should('be.visible');
        cy.get('[data-cy="steps-textarea"]').type(
            '1. Melt chocolate and butter\n2. Whisk eggs with sugar\n3. Fold together and bake'
        );
        cy.get('[data-cy="apply-steps-button"]').click();

        // Verify mode switched back to list mode with all 3 steps
        cy.get('[data-cy="recipe-step-0"]').should(
            'have.value',
            'Melt chocolate and butter'
        );
        cy.get('[data-cy="recipe-step-1"]').should(
            'have.value',
            'Whisk eggs with sugar'
        );
        cy.get('[data-cy="recipe-step-2"]').should(
            'have.value',
            'Fold together and bake'
        );
        cy.get('[data-cy="modal-action-button"]').click();

        // Step 5: On Related Content step, save draft explicitly
        cy.intercept('POST', '/api/draft').as('saveDraftWithPlainText');
        cy.get('[data-testid="load-draft-button"]').click();
        cy.wait('@saveDraftWithPlainText');

        // Step 6: Hard reload page
        cy.reload();
        cy.ensureEnglish();

        // Step 7: Open RecipeModal again -> draft should auto-load all fields
        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');

        // Go back through previous steps to verify all fields are intact
        cy.get('[data-cy="secondary-action-button"]').click(); // Step 4: Steps
        cy.get('[data-cy="recipe-step-0"]').should(
            'have.value',
            'Melt chocolate and butter'
        );
        cy.get('[data-cy="recipe-step-1"]').should(
            'have.value',
            'Whisk eggs with sugar'
        );
        cy.get('[data-cy="recipe-step-2"]').should(
            'have.value',
            'Fold together and bake'
        );

        cy.get('[data-cy="secondary-action-button"]').click(); // Step 3: Methods
        cy.get('[data-cy="method-box-Oven"]').should('have.class', 'selected');

        cy.get('[data-cy="secondary-action-button"]').click(); // Step 2: Ingredients
        cy.get('[data-cy="recipe-ingredient-0"]').should(
            'have.value',
            '200g Dark Chocolate'
        );
        cy.get('[data-cy="recipe-ingredient-1"]').should(
            'have.value',
            '100g Butter'
        );
        cy.get('[data-cy="recipe-ingredient-2"]').should(
            'have.value',
            '2 Eggs'
        );
        cy.get('[data-cy="recipe-ingredient-3"]').should(
            'have.value',
            '50g Sugar'
        );

        cy.get('[data-cy="secondary-action-button"]').click(); // Step 1: Description
        cy.get('[data-cy="recipe-title"]').should('have.value', recipeName);

        cy.get('[data-cy="secondary-action-button"]').click(); // Step 0: Category
        cy.get('[data-cy="category-box-Desserts"]').should(
            'have.class',
            'selected'
        );
    });

    it('clears all ingredients intentionally and persists empty state without restoring old draft items', () => {
        const recipeName = `Clear Ingr ${Date.now()}`;

        // Step 1: Open modal and create draft with ingredients
        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');

        cy.get('[data-cy="category-box-Desserts"]').click();
        cy.get('[data-cy="modal-action-button"]').click();

        cy.get('[data-cy="recipe-title"]').type(recipeName);
        cy.get('[data-cy="recipe-description"]').type(
            'Delicious dessert recipe'
        );
        cy.get('[data-cy="modal-action-button"]').click();

        // Fill 2 ingredients
        cy.get('[data-cy="recipe-ingredient-0"]').type('Vanilla Extract');
        cy.get('[data-cy="add-ingredient-button"]').click();
        cy.get('[data-cy="recipe-ingredient-1"]').type('Whole Milk');
        cy.intercept('POST', '/api/draft').as('saveInitialDraft');
        cy.get('[data-testid="load-draft-button"]').click();
        cy.wait('@saveInitialDraft');

        // Step 2: Clear all ingredient inputs explicitly
        cy.get('[data-cy="recipe-ingredient-0"]').clear();
        cy.get('[data-cy="recipe-ingredient-1"]').clear();
        cy.intercept('POST', '/api/draft').as('saveClearedDraft');
        cy.get('[data-testid="load-draft-button"]').click();
        cy.wait('@saveClearedDraft');

        // Close modal
        cy.get('[data-testid="close-modal-button"]').click();

        // Step 3: Reload page to verify persistence
        cy.reload();
        cy.ensureEnglish();

        // Step 4: Re-open RecipeModal - wait for draft to auto-load
        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');
        cy.get('[data-testid="drafts-indicator-dot"]').should('be.visible');

        // Verify ingredient inputs are empty (not reverted to old values)
        cy.get('[data-cy="recipe-ingredient-0"]').should('have.value', '');

        // Verify backwards navigation retains previous steps
        cy.get('[data-cy="secondary-action-button"]').click(); // Step 1: Description
        cy.get('[data-cy="recipe-title"]').should('have.value', recipeName);
    });

    it('flushes in-flight draft save when opening DraftsModal from RecipeModal header', () => {
        const recipeName = `In-Flight Save Test ${Date.now()}`;

        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');

        cy.get('[data-cy="category-box-Desserts"]').click();
        cy.get('[data-cy="modal-action-button"]').click();

        cy.get('[data-cy="recipe-title"]').type(recipeName);

        // Click "My Drafts" icon button in modal header immediately without clicking Save first
        cy.intercept('POST', '/api/draft').as('saveBeforeModalOpen');
        cy.get('[data-testid="open-drafts-modal-button"]').click();
        cy.wait('@saveBeforeModalOpen');

        // DraftsModal should open and display the draft with the freshly typed title
        cy.get('[data-testid="drafts-modal"]').should('be.visible');
        cy.contains(recipeName).should('be.visible');
    });

    it('flushes in-flight draft save synchronously upon rapid Next navigation without dropping edits', () => {
        const recipeName = `Fast Save ${Date.now()}`;

        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');

        cy.get('[data-cy="category-box-Desserts"]').click();
        cy.get('[data-cy="modal-action-button"]').click();

        cy.get('[data-cy="recipe-title"]').type(recipeName);
        cy.get('[data-cy="recipe-description"]').type('Quick recipe');
        cy.get('[data-cy="modal-action-button"]').click(); // to Step 2: Ingredients

        // Rapid typing into ingredients then immediate Next click
        cy.get('[data-cy="recipe-ingredient-0"]').type('200g Fresh Berries');
        cy.get('[data-cy="modal-action-button"]').click(); // to Step 3: Methods

        // Select method and click Save Draft
        cy.get('[data-cy="method-box-Oven"]').click();
        cy.get('[data-testid="load-draft-button"]').click();
        cy.get('[data-testid="close-modal-button"]').click();

        // Reload page to verify persistence
        cy.reload();
        cy.ensureEnglish();

        // Re-open RecipeModal - auto-resumes on Step 3 (Methods)
        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');
        cy.get('[data-testid="drafts-indicator-dot"]').should('be.visible');

        cy.get('[data-cy="method-box-Oven"]').should('have.class', 'selected');

        // Navigate back to Ingredients
        cy.get('[data-cy="secondary-action-button"]').click();
        cy.get('[data-cy="recipe-ingredient-0"]').should(
            'have.value',
            '200g Fresh Berries'
        );

        // Navigate back to Description
        cy.get('[data-cy="secondary-action-button"]').click();
        cy.get('[data-cy="recipe-title"]').should('have.value', recipeName);
    });

    it('clears all recipe steps in list mode and mode toggle without resurrecting stale step entries', () => {
        const recipeName = `Steps Clr ${Date.now()}`;

        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');

        cy.get('[data-cy="category-box-Desserts"]').click();
        cy.get('[data-cy="modal-action-button"]').click();

        cy.get('[data-cy="recipe-title"]').type(recipeName);
        cy.get('[data-cy="recipe-description"]').type('Steps clearing test');
        cy.get('[data-cy="modal-action-button"]').click();

        cy.get('[data-cy="recipe-ingredient-0"]').type('1 Apple');
        cy.get('[data-cy="modal-action-button"]').click();

        cy.get('[data-cy="method-box-Oven"]').click();
        cy.get('[data-cy="modal-action-button"]').click(); // to Step 4: Steps

        // Add 2 steps
        cy.get('[data-cy="recipe-step-0"]').type('Slice the apple');
        cy.get('[data-cy="add-step-button"]').click();
        cy.get('[data-cy="recipe-step-1"]').type('Bake until golden');

        cy.intercept('POST', '/api/draft').as('saveInitialStepsDraft');
        cy.get('[data-testid="load-draft-button"]').click();
        cy.wait('@saveInitialStepsDraft');

        // Clear both steps
        cy.get('[data-cy="recipe-step-0"]').clear();
        cy.get('[data-cy="recipe-step-1"]').clear();

        // Toggle to plain text and verify empty
        cy.get('[data-cy="toggle-input-mode"]').click();
        cy.get('[data-cy="steps-textarea"]').should('have.value', '');

        // Toggle back to list mode
        cy.get('[data-cy="toggle-input-mode"]').click();

        // Save cleared draft
        cy.intercept('POST', '/api/draft').as('saveClearedStepsDraft');
        cy.get('[data-testid="load-draft-button"]').click();
        cy.wait('@saveClearedStepsDraft');

        cy.get('[data-testid="close-modal-button"]').click();

        // Reload page to verify persistence from Redis
        cy.reload();
        cy.ensureEnglish();

        // Re-open RecipeModal - auto-resumes on Step 4 (Steps)
        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');
        cy.get('[data-testid="drafts-indicator-dot"]').should('be.visible');

        // Verify Step 0 is empty (not restored to "Slice the apple")
        cy.get('[data-cy="recipe-step-0"]').should('have.value', '');

        // Backwards navigation retains previous data
        cy.get('[data-cy="secondary-action-button"]').click(); // Step 3 Methods
        cy.get('[data-cy="method-box-Oven"]').should('have.class', 'selected');

        cy.get('[data-cy="secondary-action-button"]').click(); // Step 2 Ingredients
        cy.get('[data-cy="recipe-ingredient-0"]').should(
            'have.value',
            '1 Apple'
        );

        cy.get('[data-cy="secondary-action-button"]').click(); // Step 1 Description
        cy.get('[data-cy="recipe-title"]').should('have.value', recipeName);
    });

    it('persists deep form state including YouTube URL, linked recipes, and quest across page reload', () => {
        const recipeName = `Deep Form Draft ${Date.now()}`;

        // Step 1: Open modal and navigate through steps to Step 5 (Related Content)
        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');

        // Step 0: Category
        cy.get('[data-cy="category-box-Desserts"]').click();
        cy.get('[data-cy="modal-action-button"]').click();

        // Step 1: Description
        cy.get('[data-cy="recipe-title"]').type(recipeName);
        cy.get('[data-cy="recipe-description"]').type(
            'Rich metadata recipe with video and quest'
        );
        cy.get('[data-cy="modal-action-button"]').click();

        // Step 2: Ingredients
        cy.get('[data-cy="recipe-ingredient-0"]').type('200g Dark Chocolate');
        cy.get('[data-cy="modal-action-button"]').click();

        // Step 3: Methods
        cy.get('[data-cy="method-box-Oven"]').click();
        cy.get('[data-cy="modal-action-button"]').click();

        // Step 4: Steps
        cy.get('[data-cy="recipe-step-0"]').type('Melt chocolate and bake');
        cy.get('[data-cy="modal-action-button"]').click();

        // Step 5: Related Content - switch to Videos tab
        cy.get('[data-testid="related-content-tabs"]').should('exist');
        cy.contains('button', 'Videos').click();

        // Fill YouTube URL
        cy.get('[data-cy="youtube-url-input"]').type(
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        );

        // Save draft explicitly
        cy.intercept('POST', '/api/draft').as('saveDeepDraft');
        cy.get('[data-testid="load-draft-button"]').click();
        cy.wait('@saveDeepDraft');

        // Close modal
        cy.get('[data-testid="close-modal-button"]').click();

        // Reload page to simulate user returning to session later
        cy.reload();
        cy.ensureEnglish();

        // Re-open RecipeModal - wait for draft to auto-load on Step 5
        cy.get('[data-cy="post-recipe"]').click();
        cy.get('[data-testid="modal-title"]').should('be.visible');
        cy.get('[data-testid="drafts-indicator-dot"]').should('be.visible');

        // Switch to Videos tab and verify YouTube URL is preserved
        cy.contains('button', 'Videos').click();
        cy.get('[data-cy="youtube-url-input"]').should(
            'have.value',
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        );

        // Verify previous steps retain their data upon navigating backward
        cy.get('[data-cy="secondary-action-button"]').click(); // Step 4: Steps
        cy.get('[data-cy="recipe-step-0"]').should(
            'have.value',
            'Melt chocolate and bake'
        );

        cy.get('[data-cy="secondary-action-button"]').click(); // Step 3: Methods
        cy.get('[data-cy="method-box-Oven"]').should('have.class', 'selected');

        cy.get('[data-cy="secondary-action-button"]').click(); // Step 2: Ingredients
        cy.get('[data-cy="recipe-ingredient-0"]').should(
            'have.value',
            '200g Dark Chocolate'
        );

        cy.get('[data-cy="secondary-action-button"]').click(); // Step 1: Description
        cy.get('[data-cy="recipe-title"]').should('have.value', recipeName);
    });

    it('isolates solo draft quota from shared collaborative drafts in unified DraftsModal', () => {
        // Step 1: Create 5 solo drafts (reaching 5-draft quota)
        for (let i = 1; i <= 5; i++) {
            cy.request('POST', '/api/draft', {
                draftId: `solo-draft-quota-${i}`,
                title: `Solo Quota Recipe ${i}`,
                categories: ['quick'],
                updatedAt: new Date().toISOString(),
            });
        }

        // Step 2: Create 2 shared collaborative drafts via invite
        cy.request('POST', '/api/draft/invite', {
            categories: ['Desserts'],
            title: 'Shared Collab Draft 1',
            description: 'Collaborative draft 1',
        });
        cy.request('POST', '/api/draft/invite', {
            categories: ['Dinner'],
            title: 'Shared Collab Draft 2',
            description: 'Collaborative draft 2',
        });

        // Step 3: Open DraftsModal via UserMenu
        cy.get('[data-cy="user-menu"]').click();
        cy.get('[data-cy="user-menu-my-drafts"]').should('be.visible').click();

        // Verify DraftsModal displays all 7 drafts (5 solo + 2 shared)
        cy.get('[data-testid="drafts-modal"]').should('be.visible');
        cy.get('[data-testid="draft-card"]').should('have.length', 7);

        // Verify solo drafts display 365-day TTL badge and shared drafts display 7-day TTL badge
        cy.contains('Solo Quota Recipe 1').should('be.visible');
        cy.contains('Shared Collab Draft 1').should('be.visible');
        cy.get('[data-testid="draft-card"]')
            .first()
            .within(() => {
                cy.get('[data-testid="draft-ttl-badge"]').should('be.visible');
            });

        // Step 4: Attempting to create a 6th solo draft is rejected with 409
        cy.request({
            method: 'POST',
            url: '/api/draft',
            body: {
                draftId: 'solo-draft-quota-6',
                title: 'Solo Quota Recipe 6 (Over limit)',
                categories: ['Desserts'],
            },
            failOnStatusCode: false,
        }).then((res) => {
            expect(res.status).to.eq(409);
        });

        // Step 5: Delete 1 solo draft to free up a slot
        cy.request('DELETE', '/api/draft?draftId=solo-draft-quota-1').then(
            (delRes) => {
                expect(delRes.status).to.eq(200);
            }
        );

        // Step 6: Now can successfully create a new solo draft
        cy.request('POST', '/api/draft', {
            draftId: 'solo-draft-quota-new',
            title: 'New Allowed Solo Draft',
            categories: ['Desserts'],
        }).then((postRes) => {
            expect(postRes.status).to.eq(200);
        });
    });

    it('displays warning badge styling on drafts nearing expiration (TTL < 24h)', () => {
        // Create a shared draft
        cy.request('POST', '/api/draft/invite', {
            categories: ['Desserts'],
            title: 'Expiring Soon Berry Tart',
            description: 'Draft with impending expiration',
        }).then((response) => {
            const draftId = response.body.draftId;

            // Intercept active drafts endpoint with simulated updatedAt corresponding to 2 hours remaining
            cy.intercept('GET', '/api/draft/active', (req) => {
                req.continue((res) => {
                    if (Array.isArray(res.body)) {
                        res.body = res.body.map((d: { draftId: string }) => {
                            if (d.draftId === draftId) {
                                return {
                                    ...d,
                                    updatedAt: new Date(
                                        Date.now() - (7 * 86400 - 7200) * 1000
                                    ).toISOString(),
                                };
                            }
                            return d;
                        });
                    }
                });
            }).as('getActiveDraftsWithWarningTTL');

            // Open DraftsModal via UserMenu
            cy.get('[data-cy="user-menu"]').click();
            cy.get('[data-cy="user-menu-my-drafts"]')
                .should('be.visible')
                .click();
            cy.wait('@getActiveDraftsWithWarningTTL');

            // Verify DraftsModal displays the expiring soon draft
            cy.get('[data-testid="drafts-modal"]').should('be.visible');
            cy.contains('Expiring Soon Berry Tart')
                .closest('[data-testid="draft-card"]')
                .within(() => {
                    // Badge should be visible and indicate expiration warning
                    cy.get('[data-testid="draft-ttl-badge"]')
                        .should('be.visible')
                        .and('contain.text', 'Expires in 2 hours');
                });

            // Clicking the expiring draft card opens RecipeModal
            cy.contains('Expiring Soon Berry Tart').click();
            cy.get('[data-testid="modal-title"]').should('be.visible');
            cy.get('[data-testid="drafts-indicator-dot"]').should('be.visible');
        });
    });
});
