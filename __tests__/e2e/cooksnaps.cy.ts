describe('Cooksnaps Upload, Display & Deletion E2E (AWS S3 Emulator)', () => {
    let testRecipeId = '';
    let createdCooksnapId = '';
    const testRecipeTitle = 'E2E Recipe for Cooksnaps';

    // Valid 1x1 PNG so browser canvas compression and <img> rendering succeed cleanly
    const VALID_PNG_BASE64 =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    const cleanupResources = () => {
        if (createdCooksnapId) {
            cy.request({
                method: 'DELETE',
                url: `/api/cooksnaps/${createdCooksnapId}`,
                failOnStatusCode: false,
            });
            createdCooksnapId = '';
        }

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
                        'Recipe seeded for testing Cooksnaps S3 emulator upload and deletion.',
                    categories: ['Salads'],
                    ingredients: ['Fresh greens', 'Olive oil'],
                    steps: ['Wash greens', 'Drizzle olive oil'],
                    method: 'Raw',
                    minutes: 10,
                    calories: 120,
                    imageSrc: `https://res.cloudinary.com/demo/image/upload/cooksnap-e2e-${timestamp}.jpg`,
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

    it('uploads a cooksnap photo to S3 emulator, displays it in gallery and lightbox, and deletes it from DB and S3', () => {
        ensureTestRecipe().then((recipeId) => {
            cy.task('log', '=== Navigating to seeded recipe detail page ===');
            cy.visit(`/recipes/${recipeId}`);
            cy.url().should('include', `/recipes/${recipeId}`);

            cy.task('log', '=== Opening Cooksnap modal ===');
            cy.get('[data-testid="post-steps-cooksnap-btn"]')
                .should('be.visible')
                .click();
            cy.get('[data-testid="cooksnap-dropzone"]').should('be.visible');

            cy.task('log', '=== Attaching image, rating, and cook note ===');
            cy.get('[data-testid="cooksnap-file-input"]').selectFile(
                {
                    contents: Cypress.Buffer.from(VALID_PNG_BASE64, 'base64'),
                    fileName: 'cooksnap-e2e.png',
                    mimeType: 'image/png',
                },
                { force: true }
            );
            cy.get('[data-testid="remove-cooksnap-photo"]').should(
                'be.visible'
            );

            const noteText =
                'Turned out crispy and delicious! Verified with S3 emulator.';
            cy.get('[data-testid="cooksnap-note-input"]')
                .closest('[data-modal-backdrop]')
                .within(() => {
                    cy.get('[data-testid="star-5"]').click();
                    cy.get('[data-testid="cooksnap-note-input"]')
                        .should('be.visible')
                        .type(noteText);
                });

            cy.intercept('POST', '/api/upload/r2').as('presignR2');
            cy.intercept('PUT', 'http://127.0.0.1:9298/**').as('s3PutUpload');
            cy.intercept('POST', '/api/cooksnaps').as('createCooksnap');

            cy.task('log', '=== Submitting cooksnap ===');
            cy.get('[data-testid="cooksnap-note-input"]')
                .closest('[data-modal-backdrop]')
                .find('[data-cy="modal-action-button"]')
                .should('not.be.disabled')
                .click();

            cy.wait('@presignR2').then((interception) => {
                expect(interception.response?.statusCode).to.eq(200);
                expect(interception.response?.body?.uploadUrl).to.include(
                    'http://127.0.0.1:9298/'
                );
                expect(interception.response?.body?.publicUrl).to.include(
                    'http://127.0.0.1:9298/remakes/'
                );
            });

            cy.wait('@s3PutUpload').then((interception) => {
                expect(interception.response?.statusCode).to.be.oneOf([
                    200, 204,
                ]);
            });

            let uploadedImageSrc = '';

            cy.wait('@createCooksnap').then((interception) => {
                expect(interception.response?.statusCode).to.eq(201);
                createdCooksnapId = interception.response?.body?.id;
                uploadedImageSrc = interception.response?.body?.imageSrc;
                expect(createdCooksnapId).to.be.a('string');
                expect(createdCooksnapId.length).to.be.greaterThan(0);
                expect(uploadedImageSrc).to.include(
                    'http://127.0.0.1:9298/remakes/'
                );
            });

            cy.get('[data-testid="cooksnap-note-input"]').should('not.exist');

            cy.task(
                'log',
                '=== Verifying gallery card, proxied image, and persistence ==='
            );
            cy.get('[data-testid="cooked-gallery"]', {
                timeout: 10000,
            }).should('be.visible');

            cy.then(() => {
                cy.request(uploadedImageSrc).then((res) => {
                    expect(res.status).to.eq(200);
                    expect(res.headers['content-type']).to.include('image/');
                    expect(res.body.length).to.be.greaterThan(0);
                });

                cy.request({
                    url: '/api/image-proxy',
                    qs: {
                        url: uploadedImageSrc,
                        w: 400,
                        h: 400,
                        q: 'auto:good',
                    },
                }).then((res) => {
                    expect(res.status).to.eq(200);
                    expect(res.headers['content-type']).to.include('image/');
                    expect(res.body.length).to.be.greaterThan(0);
                });

                cy.get(`[data-testid="cooksnap-card-${createdCooksnapId}"]`)
                    .should('be.visible')
                    .within(() => {
                        cy.contains(noteText).should('be.visible');
                        cy.contains('5').should('be.visible');
                        cy.get('img[alt^="Cooksnap by "]')
                            .should('have.attr', 'src')
                            .and('include', '/api/image-proxy');
                        cy.get('img[alt^="Cooksnap by "]')
                            .then(($img) => {
                                const imgEl = $img[0] as HTMLImageElement;
                                const src = imgEl.currentSrc || imgEl.src;
                                return cy
                                    .window({ log: false })
                                    .then(async (win) => {
                                        const r = await win.fetch(src);
                                        const blob = await r.blob();
                                        let bitmapInfo = 'none';
                                        try {
                                            const bmp =
                                                await win.createImageBitmap(
                                                    blob
                                                );
                                            bitmapInfo = `${bmp.width}x${bmp.height}`;
                                            bmp.close();
                                        } catch (err: any) {
                                            bitmapInfo = `err:${err?.message || err}`;
                                        }
                                        const blobImgOk =
                                            await new Promise<string>(
                                                (resolve) => {
                                                    const t = new win.Image();
                                                    const u =
                                                        win.URL.createObjectURL(
                                                            blob
                                                        );
                                                    t.onload = () => {
                                                        win.URL.revokeObjectURL(
                                                            u
                                                        );
                                                        resolve(
                                                            `ok:${t.naturalWidth}x${t.naturalHeight}`
                                                        );
                                                    };
                                                    t.onerror = () => {
                                                        win.URL.revokeObjectURL(
                                                            u
                                                        );
                                                        resolve('onerror');
                                                    };
                                                    t.src = u;
                                                }
                                            );
                                        const urlImgOk =
                                            await new Promise<string>(
                                                (resolve) => {
                                                    const t = new win.Image();
                                                    t.onload = () =>
                                                        resolve(
                                                            `ok:${t.naturalWidth}x${t.naturalHeight}`
                                                        );
                                                    t.onerror = () =>
                                                        resolve('onerror');
                                                    t.src = src;
                                                }
                                            );
                                        const perfEntries = win.performance
                                            .getEntriesByType('resource')
                                            .filter((e) =>
                                                e.name.includes('image-proxy')
                                            )
                                            .map((e: any) => ({
                                                q: e.name
                                                    .split('?')[1]
                                                    ?.slice(-30),
                                                status: e.responseStatus,
                                                enc: e.encodedBodySize,
                                                dec: e.decodedBodySize,
                                            }));
                                        return {
                                            src,
                                            status: r.status,
                                            type: blob.type,
                                            size: blob.size,
                                            bitmapInfo,
                                            blobImgOk,
                                            urlImgOk,
                                            perfEntries,
                                            complete: imgEl.complete,
                                            naturalWidth: imgEl.naturalWidth,
                                            naturalHeight: imgEl.naturalHeight,
                                        };
                                    });
                            })
                            .then((info) => {
                                cy.task(
                                    'log',
                                    `IMG DEBUG: ${JSON.stringify(info)}`
                                );
                            });
                        cy.get('img[alt^="Cooksnap by "]').should(($img) => {
                            const imgEl = $img[0] as HTMLImageElement;
                            expect(
                                imgEl.complete,
                                `complete for ${imgEl.currentSrc}`
                            ).to.eq(true);
                            expect(
                                imgEl.naturalWidth,
                                `naturalWidth for ${imgEl.currentSrc}`
                            ).to.be.greaterThan(0);
                        });
                    });

                cy.reload();
                cy.get('[data-testid="cooked-gallery"]', {
                    timeout: 10000,
                }).should('be.visible');

                cy.task('log', '=== Opening lightbox and checking details ===');
                cy.get(
                    `[data-testid="cooksnap-card-${createdCooksnapId}"]`
                ).click();
                cy.get('[data-testid="lightbox-modal"]').should('be.visible');
                cy.get('[data-testid="cooksnap-lightbox-details"]').should(
                    'be.visible'
                );
                cy.get('[data-testid="cooksnap-lightbox-comment"]').should(
                    'contain.text',
                    noteText
                );
                cy.get('[data-testid="cooksnap-lightbox-rating"]').should(
                    'be.visible'
                );

                cy.get('[aria-label="Close photo lightbox"]').click();
                cy.get('[data-testid="lightbox-modal"]').should('not.exist');

                cy.task(
                    'log',
                    '=== Deleting cooksnap and verifying S3 object removal ==='
                );
                cy.intercept(
                    'DELETE',
                    `/api/cooksnaps/${createdCooksnapId}`
                ).as('deleteCooksnap');

                cy.get(
                    `[data-testid="delete-cooksnap-${createdCooksnapId}"]`
                ).click();
                cy.get('[data-cy="modal-action-button"]')
                    .should('be.visible')
                    .click();

                cy.wait('@deleteCooksnap')
                    .its('response.statusCode')
                    .should('eq', 200);
                createdCooksnapId = '';

                cy.get('[data-testid="cooked-gallery"]', {
                    timeout: 10000,
                }).should('not.exist');

                cy.request({
                    url: uploadedImageSrc,
                    failOnStatusCode: false,
                }).then((res) => {
                    expect(res.status).to.eq(404);
                });
            });
        });
    });
});
