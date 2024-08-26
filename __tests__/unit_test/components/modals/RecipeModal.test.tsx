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
import { preparationMethods } from '@/app/components/modals/RecipeModal';
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
});
