import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';
import { parseIngredientsText, parseStepsText } from '../app/utils/textParser';

const prisma = new PrismaClient();

function askConfirmation(promptText: string): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(promptText, (answer) => {
            rl.close();
            const trimmed = answer.trim().toLowerCase();
            resolve(trimmed === 'y' || trimmed === 'yes');
        });
    });
}

interface CandidateRecipe {
    id: string;
    title: string;
    userName: string | null;
    userEmail: string | null;
    oldIngredients: string[];
    newIngredients: string[];
    ingredientsChanged: boolean;
    oldSteps: string[];
    newSteps: string[];
    stepsChanged: boolean;
}

export async function backfillSplitRecipeFields() {
    console.log(
        '🔍 Scanning database for recipes with single-field ingredients or steps...\n'
    );

    try {
        const recipes = await prisma.recipe.findMany({
            select: {
                id: true,
                title: true,
                ingredients: true,
                steps: true,
                userId: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        const candidates: CandidateRecipe[] = [];

        for (const recipe of recipes) {
            let ingredientsChanged = false;
            let stepsChanged = false;
            let newIngredients = [...recipe.ingredients];
            let newSteps = [...recipe.steps];

            // 1. Check if ingredients has only 1 item and parses into multiple items
            if (recipe.ingredients && recipe.ingredients.length === 1) {
                const parsed = parseIngredientsText(recipe.ingredients[0]);
                if (parsed.length > 1) {
                    newIngredients = parsed;
                    ingredientsChanged = true;
                }
            }

            // 2. Check if steps has only 1 item and parses into multiple steps
            if (recipe.steps && recipe.steps.length === 1) {
                const parsed = parseStepsText(recipe.steps[0]);
                if (parsed.length > 1) {
                    newSteps = parsed;
                    stepsChanged = true;
                }
            }

            if (ingredientsChanged || stepsChanged) {
                candidates.push({
                    id: recipe.id,
                    title: recipe.title,
                    userName: recipe.user?.name || null,
                    userEmail: recipe.user?.email || null,
                    oldIngredients: recipe.ingredients,
                    newIngredients,
                    ingredientsChanged,
                    oldSteps: recipe.steps,
                    newSteps,
                    stepsChanged,
                });
            }
        }

        if (candidates.length === 0) {
            console.log(
                '✅ No recipes found with single-field ingredients or steps needing splitting.'
            );
            return;
        }

        console.log(`📋 Found ${candidates.length} recipe(s) to be updated:\n`);

        candidates.forEach((candidate, index) => {
            console.log('='.repeat(80));
            console.log(
                `[${index + 1}/${candidates.length}] Recipe: "${candidate.title}" (ID: ${candidate.id})`
            );
            if (candidate.userName || candidate.userEmail) {
                console.log(
                    `Author: ${candidate.userName || 'Unknown'} (${candidate.userEmail || 'No email'})`
                );
            }
            console.log('-'.repeat(80));

            if (candidate.ingredientsChanged) {
                console.log(
                    `🧂 INGREDIENTS (${candidate.oldIngredients.length} -> ${candidate.newIngredients.length}):`
                );
                console.log(`   [-] ${candidate.oldIngredients[0]}`);
                candidate.newIngredients.forEach((ing, i) => {
                    console.log(`   [+] ${i + 1}. ${ing}`);
                });
            } else {
                console.log(
                    `🧂 INGREDIENTS: No change (${candidate.oldIngredients.length} items)`
                );
            }

            console.log('-'.repeat(80));

            if (candidate.stepsChanged) {
                console.log(
                    `🍳 STEPS (${candidate.oldSteps.length} -> ${candidate.newSteps.length}):`
                );
                console.log(`   [-] ${candidate.oldSteps[0]}`);
                candidate.newSteps.forEach((st, i) => {
                    console.log(`   [+] ${i + 1}. ${st}`);
                });
            } else {
                console.log(
                    `🍳 STEPS: No change (${candidate.oldSteps.length} items)`
                );
            }
            console.log('='.repeat(80) + '\n');
        });

        // Check command line arguments for non-interactive confirmation
        const autoConfirm =
            process.argv.includes('--yes') || process.argv.includes('-y');

        let confirmed = autoConfirm;
        if (!confirmed) {
            confirmed = await askConfirmation(
                `❓ Do you want to apply these changes to the database for ${candidates.length} recipe(s)? (y/n): `
            );
        }

        if (!confirmed) {
            console.log(
                '\n❌ Operation cancelled. No changes were made to the database.'
            );
            return;
        }

        console.log('\n🚀 Updating recipes in database...');
        let updatedCount = 0;

        for (const candidate of candidates) {
            await prisma.recipe.update({
                where: { id: candidate.id },
                data: {
                    ingredients: candidate.newIngredients,
                    steps: candidate.newSteps,
                },
            });
            updatedCount++;
            console.log(`   ✓ Updated "${candidate.title}" (${candidate.id})`);
        }

        console.log(
            `\n✨ Successfully updated ${updatedCount} recipe(s) in the database!`
        );
    } catch (error) {
        console.error('❌ Backfill failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    backfillSplitRecipeFields();
}
