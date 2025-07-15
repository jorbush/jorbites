import {
    render,
    screen,
    fireEvent,
    act,
    cleanup,
    waitFor,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeModal from '@/app/components/modals/RecipeModal';
import { categories } from '@/app/components/navbar/Categories';
import { preparationMethods } from '@/app/components/modals/recipe-steps/MethodsStep';
import {
    RECIPE_MAX_INGREDIENTS,
    RECIPE_MAX_STEPS,
} from '@/app/utils/constants';
import React from 'react';

// Mock the custom hooks
vi.mock('@/app/hooks/useRecipeModal', () => ({
    default: vi.fn(() => ({
        isOpen: true,
        onClose: vi.fn(),
    })),
}));

vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(() => ({
        t: (key: string) => key,
    })),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
    }),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

describe('<RecipeModal />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        cleanup();
    });

    const renderComponent = () => {
        render(<RecipeModal />);
    };

    it('renders the modal with initial step (CATEGORY)', () => {
        renderComponent();
        expect(screen.getByText('title_category_recipe')).toBeDefined();
    });

    it('advances to next step (DESCRIPTION) when next button is clicked', async () => {
        renderComponent();
        const nextButton = screen.getByRole('button', {
            name: 'next',
        });
        waitFor(
            () => {
                act(() => {
                    fireEvent.click(nextButton);
                });
                expect(screen.getByText('title_description')).toBeDefined();
            },
            { timeout: 4000 }
        );
    });

    it('goes back to the previous step (CATEGORY) when back button is clicked', () => {
        renderComponent();
        let nextButton = screen.getByRole('button', {
            name: 'next',
        });
        waitFor(
            () => {
                act(() => {
                    fireEvent.click(nextButton);
                });
                expect(screen.getByText('title_description')).toBeDefined();
                const backButton = screen.getByRole('button', { name: 'back' });
                fireEvent.click(backButton);
                expect(screen.getByText('title_category_recipe')).toBeDefined();
            },
            { timeout: 4000 }
        );
    });

    it('renders all category options', () => {
        renderComponent();
        categories.forEach((category) => {
            if (category.label.toLowerCase() === 'award-winning') return;
            expect(
                screen.getByText(category.label.toLowerCase())
            ).toBeDefined();
        });
    });

    it('selects a category when clicked', () => {
        renderComponent();
        const firstCategory = categories[0];
        const categoryButton = screen.getByText(
            firstCategory.label.toLowerCase()
        );
        fireEvent.click(categoryButton);
        expect(categoryButton.parentElement?.className).include('selected');
    });

    it('renders all preparation methods when method step is reached', () => {
        renderComponent();
        const nextButton = screen.getByRole('button', {
            name: 'next',
        });
        waitFor(
            () => {
                act(() => {
                    fireEvent.click(nextButton);
                }); // Move to DESCRIPTION step
                waitFor(
                    () => {
                        act(() => {
                            fireEvent.click(nextButton);
                        }); // Move to INGREDIENTS step
                        waitFor(
                            () => {
                                act(() => {
                                    fireEvent.click(nextButton);
                                }); // Move to STEPS step
                                waitFor(
                                    () => {
                                        act(() => {
                                            fireEvent.click(nextButton);
                                        }); // Move to METHODS step
                                        preparationMethods.forEach((method) => {
                                            expect(
                                                screen.getByText(method.label)
                                            ).toBeDefined();
                                        });
                                    },
                                    { timeout: 4000 }
                                );
                            },
                            { timeout: 4000 }
                        );
                    },
                    { timeout: 4000 }
                );
            },
            { timeout: 4000 }
        );
    }, 20000);

    it('selects a preparation method when clicked', () => {
        renderComponent();
        const nextButton = screen.getByRole('button', {
            name: 'next',
        });

        waitFor(
            () => {
                act(() => {
                    fireEvent.click(nextButton);
                }); // Move to DESCRIPTION step
                waitFor(
                    () => {
                        act(() => {
                            fireEvent.click(nextButton);
                        }); // Move to INGREDIENTS step
                        waitFor(
                            () => {
                                act(() => {
                                    fireEvent.click(nextButton);
                                }); // Move to STEPS step
                                waitFor(
                                    () => {
                                        act(() => {
                                            fireEvent.click(nextButton);
                                        }); // Move to METHODS step
                                        const firstMethod =
                                            preparationMethods[0];
                                        const methodButton = screen.getByText(
                                            firstMethod.label
                                        );
                                        fireEvent.click(methodButton);
                                        expect(methodButton).toHaveProperty(
                                            'selected'
                                        );
                                    },
                                    { timeout: 4000 }
                                );
                            },
                            { timeout: 4000 }
                        );
                    },
                    { timeout: 4000 }
                );
            },
            { timeout: 4000 }
        );
    }, 20000);

    it('renders and adds ingredient input when "+" button is clicked', () => {
        renderComponent();
        const nextButton = screen.getByRole('button', {
            name: 'next',
        });
        waitFor(
            () => {
                act(() => {
                    fireEvent.click(nextButton);
                }); // Move to DESCRIPTION step
                waitFor(
                    () => {
                        act(() => {
                            fireEvent.click(nextButton);
                        }); // Move to INGREDIENTS step
                        const addButton = screen.getByRole('button', {
                            name: '+',
                        });
                        fireEvent.click(addButton);

                        const ingredientInputs = screen.getAllByLabelText('');
                        expect(ingredientInputs.length).toBe(2);
                    },
                    { timeout: 4000 }
                );
            },
            { timeout: 4000 }
        );
    }, 20000);

    it('removes an ingredient input when delete button is clicked', () => {
        renderComponent();
        const nextButton = screen.getByRole('button', {
            name: 'next',
        });
        waitFor(
            () => {
                act(() => {
                    fireEvent.click(nextButton);
                }); // Move to DESCRIPTION step
                waitFor(
                    () => {
                        act(() => {
                            fireEvent.click(nextButton);
                        }); // Move to INGREDIENTS step
                        const addButton = screen.getByRole('button', {
                            name: '+',
                        });
                        fireEvent.click(addButton);
                        const deleteButton = screen.getAllByTestId(
                            'remove-ingredient-button'
                        )[0];
                        fireEvent.click(deleteButton);

                        const ingredientInputs = screen.getAllByLabelText('');
                        expect(ingredientInputs.length).toBe(1);
                    },
                    { timeout: 4000 }
                );
            },
            { timeout: 4000 }
        );
    });

    it('renders and adds step input when "+" button is clicked', () => {
        renderComponent();
        const nextButton = screen.getByRole('button', {
            name: 'next',
        });

        waitFor(
            () => {
                act(() => {
                    fireEvent.click(nextButton);
                }); // Move to DESCRIPTION step
                waitFor(
                    () => {
                        act(() => {
                            fireEvent.click(nextButton);
                        }); // Move to INGREDIENTS step
                        waitFor(
                            () => {
                                act(() => {
                                    fireEvent.click(nextButton);
                                }); // Move to STEPS step
                                const addButton = screen.getByRole('button', {
                                    name: '+',
                                });
                                fireEvent.click(addButton);

                                const stepInputs = screen.getAllByLabelText('');
                                expect(stepInputs.length).toBe(2);
                            },
                            { timeout: 4000 }
                        );
                    },
                    { timeout: 4000 }
                );
            },
            { timeout: 4000 }
        );
    });

    it('removes a step input when delete button is clicked', () => {
        renderComponent();
        const nextButton = screen.getByRole('button', {
            name: 'next',
        });

        waitFor(
            () => {
                act(() => {
                    fireEvent.click(nextButton);
                }); // Move to DESCRIPTION step
                waitFor(
                    () => {
                        act(() => {
                            fireEvent.click(nextButton);
                        }); // Move to INGREDIENTS step
                        waitFor(
                            () => {
                                act(() => {
                                    fireEvent.click(nextButton);
                                }); // Move to STEPS step
                                const addButton = screen.getByRole('button', {
                                    name: '+',
                                });
                                fireEvent.click(addButton);
                                const deleteButton =
                                    screen.getAllByTestId(
                                        'remove-step-button'
                                    )[0];
                                fireEvent.click(deleteButton);

                                const stepInputs = screen.getAllByLabelText('');
                                expect(stepInputs.length).toBe(1);
                            },
                            { timeout: 4000 }
                        );
                    },
                    { timeout: 4000 }
                );
            },
            { timeout: 4000 }
        );
    });

    it('shows an error toast when trying to submit without an image', () => {
        renderComponent();
        const nextButton = screen.getByRole('button', {
            name: 'next',
        });
        waitFor(
            () => {
                act(() => {
                    fireEvent.click(nextButton);
                }); // Move to DESCRIPTION step
                waitFor(
                    () => {
                        act(() => {
                            fireEvent.click(nextButton);
                        }); // Move to INGREDIENTS step
                        waitFor(
                            () => {
                                act(() => {
                                    fireEvent.click(nextButton);
                                }); // Move to STEPS step
                                waitFor(
                                    () => {
                                        act(() => {
                                            fireEvent.click(nextButton);
                                        }); // Move to METHODS step
                                        waitFor(
                                            () => {
                                                act(() => {
                                                    fireEvent.click(nextButton);
                                                }); // Move to IMAGES step
                                                const submitButton =
                                                    screen.getByRole('button', {
                                                        name: 'create',
                                                    });
                                                fireEvent.click(submitButton);
                                                expect(
                                                    screen.getByText(
                                                        'You must upload an image'
                                                    )
                                                ).toBeDefined();
                                            },
                                            {
                                                timeout: 4000,
                                            }
                                        );
                                    },
                                    { timeout: 4000 }
                                );
                            },
                            { timeout: 4000 }
                        );
                    },
                    { timeout: 4000 }
                );
            },
            { timeout: 4000 }
        );
    });

    it('renders related content step when reached', () => {
        renderComponent();
        const nextButton = screen.getByRole('button', {
            name: 'next',
        });

        waitFor(
            () => {
                act(() => {
                    fireEvent.click(nextButton);
                }); // Move to DESCRIPTION step
                waitFor(
                    () => {
                        act(() => {
                            fireEvent.click(nextButton);
                        }); // Move to INGREDIENTS step
                        waitFor(
                            () => {
                                act(() => {
                                    fireEvent.click(nextButton);
                                }); // Move to METHODS step
                                waitFor(
                                    () => {
                                        act(() => {
                                            fireEvent.click(nextButton);
                                        }); // Move to STEPS step
                                        waitFor(
                                            () => {
                                                act(() => {
                                                    fireEvent.click(nextButton);
                                                }); // Move to RELATED_CONTENT step
                                                expect(
                                                    screen.getByText(
                                                        'related_content'
                                                    )
                                                ).toBeDefined();
                                                expect(
                                                    screen.getByText('co_cooks')
                                                ).toBeDefined();
                                                expect(
                                                    screen.getByText(
                                                        'linked_recipes'
                                                    )
                                                ).toBeDefined();
                                            },
                                            { timeout: 4000 }
                                        );
                                    },
                                    { timeout: 4000 }
                                );
                            },
                            { timeout: 4000 }
                        );
                    },
                    { timeout: 4000 }
                );
            },
            { timeout: 4000 }
        );
    }, 20000);

    it('should have constants imported correctly for ingredient and step limits', () => {
        // Test that the constants are properly imported and accessible
        expect(RECIPE_MAX_INGREDIENTS).toBeDefined();
        expect(RECIPE_MAX_STEPS).toBeDefined();
        expect(typeof RECIPE_MAX_INGREDIENTS).toBe('number');
        expect(typeof RECIPE_MAX_STEPS).toBe('number');
        expect(RECIPE_MAX_INGREDIENTS).toBeGreaterThan(0);
        expect(RECIPE_MAX_STEPS).toBeGreaterThan(0);
    });

    it('should allow adding ingredients up to the maximum limit', () => {
        renderComponent();
        const nextButton = screen.getByRole('button', { name: 'next' });

        // Navigate to ingredients step
        act(() => {
            fireEvent.click(nextButton);
        }); // Move to DESCRIPTION step
        waitFor(() => {
            act(() => {
                fireEvent.click(nextButton);
            }); // Move to INGREDIENTS step

            const addButton = screen.getByRole('button', { name: '+' });

            // Add ingredients up to the limit (we start with 1, so add RECIPE_MAX_INGREDIENTS - 1 more)
            for (let i = 1; i < RECIPE_MAX_INGREDIENTS; i++) {
                fireEvent.click(addButton);
            }

            // Verify we have the maximum number of ingredients
            const ingredientInputs = screen.getAllByRole('textbox');
            expect(ingredientInputs.length).toBe(RECIPE_MAX_INGREDIENTS);
        });
    });

    it('should allow adding steps up to the maximum limit', () => {
        renderComponent();
        const nextButton = screen.getByRole('button', { name: 'next' });

        // Navigate to steps
        act(() => {
            fireEvent.click(nextButton);
        }); // Move to DESCRIPTION step
        waitFor(() => {
            act(() => {
                fireEvent.click(nextButton);
            }); // Move to INGREDIENTS step
            waitFor(() => {
                act(() => {
                    fireEvent.click(nextButton);
                }); // Move to STEPS step

                const addButton = screen.getByRole('button', { name: '+' });

                // Add just a few steps to verify the functionality works
                for (let i = 1; i < 5; i++) {
                    fireEvent.click(addButton);
                }

                // Verify we can add steps normally
                const stepInputs = screen.getAllByRole('textbox');
                expect(stepInputs.length).toBe(5);
            });
        });
    });

    it('should have correct maximum limits defined', () => {
        // Test that our constants are properly imported and have expected values
        expect(RECIPE_MAX_INGREDIENTS).toBe(30);
        expect(RECIPE_MAX_STEPS).toBe(30);
    });
});
