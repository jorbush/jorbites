describe('I Cooked This! Remakes & Photo Proof E2E', () => {
    beforeEach(() => {
        cy.login();
        cy.visit('/');
        cy.ensureEnglish();
    });

    it('submits a comment with I Cooked This toggle and photo proof', () => {
        cy.task('log', '=== Navigating to recipe detail page ===');
        cy.get('[data-cy="recipe-card"]', { timeout: 10000 }).first().click();
        cy.url().should('include', '/recipes/');

        cy.task(
            'log',
            '=== Filling comment form with I Cooked This toggle ==='
        );
        const commentText =
            'I cooked this dish today and it turned out amazing! 🥑';
        cy.get('[data-cy="comment-input"]').type(commentText);

        cy.get('[data-cy="cooked-toggle"]').check();

        cy.intercept('POST', '/api/upload/r2', {
            statusCode: 200,
            body: {
                uploadUrl: 'https://mock-upload-url.r2.cloudflarestorage.com',
                publicUrl: 'https://images.jorbites.com/remakes/proof-e2e.webp',
                key: 'remakes/proof-e2e.webp',
            },
        }).as('uploadR2');

        cy.intercept(
            'PUT',
            'https://mock-upload-url.r2.cloudflarestorage.com',
            {
                statusCode: 200,
            }
        ).as('putUpload');

        cy.get('[data-cy="cooked-photo-input"]').selectFile(
            {
                contents: Cypress.Buffer.from('fake-image-bytes'),
                fileName: 'remake-photo.png',
                mimeType: 'image/png',
            },
            { force: true }
        );

        cy.get('[data-cy="submit-comment"]').click();

        cy.wait('@uploadR2');

        cy.task(
            'log',
            '=== Verifying Cooked & Verified badge and photo gallery ==='
        );
        cy.get('[data-cy="cooked-badge"]').should('exist');
    });
});
