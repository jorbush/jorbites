import { describe, it, expect } from 'vitest';
import enTranslations from '@/public/locales/en/translation.json';
import esTranslations from '@/public/locales/es/translation.json';
import caTranslations from '@/public/locales/ca/translation.json';

describe('Quests Translation Keys', () => {
    const requiredQuestKeys = [
        'quests',
        'quests_subtitle',
        'request_recipe',
        'all',
        'open',
        'in_progress',
        'completed',
        'no_quests',
        'no_quests_description',
        'reply',
        'replies',
        'recipe_replies',
        'confirm_delete_quest',
        'quest_deleted',
        'share_quest',
        'fulfill_quest',
        'no_recipes_yet',
        'quest_updated',
        'quest_created',
        'edit_quest',
        'delete_quest',
        'edit_quest_subtitle',
        'request_recipe_subtitle',
        'title_required',
        'title_max_length',
        'description_required',
        'description_max_length',
        'quest_description_placeholder',
        'status',
        'accepted_recipe',
        'select_accepted_recipe',
        'linking',
        'search_quests',
        'selected_quest',
        'course_quests',
        'course_quests_desc',
    ];

    const requiredCourseDetailsKeys = [
        'course_description',
        'requirements_title',
        'requirements_intro',
        'req_open_label',
        'req_open_desc',
        'req_fulfill_label',
        'req_fulfill_desc',
        'req_status_label',
        'req_status_desc',
        'req_likes_label',
        'req_likes_desc',
        'action_required',
        'checklist_open',
        'checklist_fulfill',
        'checklist_status',
        'checklist_likes',
        'workflow_title',
        'workflow_step1_title',
        'workflow_step1_desc',
        'workflow_step2_title',
        'workflow_step2_desc',
        'workflow_step3_title',
        'workflow_step3_desc',
        'workflow_step4_title',
        'workflow_step4_desc',
        'workflow_step5_title',
        'workflow_step5_desc',
        'linking_info_title',
        'linking_desc1',
        'linking_desc2',
        'status_info_title',
        'status_desc1',
        'status_desc2',
        'final_test_description',
    ];

    const locales = [
        { name: 'en', dict: enTranslations as Record<string, any> },
        { name: 'es', dict: esTranslations as Record<string, any> },
        { name: 'ca', dict: caTranslations as Record<string, any> },
    ];

    locales.forEach(({ name, dict }) => {
        describe(`Locale: ${name}`, () => {
            it('contains all required top-level quest translation keys', () => {
                requiredQuestKeys.forEach((key) => {
                    expect(
                        dict[key],
                        `Missing key "${key}" in ${name} translation`
                    ).toBeDefined();
                    expect(
                        typeof dict[key],
                        `Key "${key}" in ${name} must be a non-empty string`
                    ).toBe('string');
                    expect(
                        dict[key].trim().length,
                        `Key "${key}" in ${name} must not be empty`
                    ).toBeGreaterThan(0);
                });
            });

            it('contains all required quests_course_details translation keys', () => {
                expect(
                    dict.quests_course_details,
                    `Missing quests_course_details in ${name}`
                ).toBeDefined();
                requiredCourseDetailsKeys.forEach((subKey) => {
                    const value = dict.quests_course_details?.[subKey];
                    expect(
                        value,
                        `Missing quests_course_details.${subKey} in ${name}`
                    ).toBeDefined();
                    expect(
                        typeof value,
                        `quests_course_details.${subKey} in ${name} must be string`
                    ).toBe('string');
                    expect(
                        value.trim().length,
                        `quests_course_details.${subKey} in ${name} must not be empty`
                    ).toBeGreaterThan(0);
                });
            });
        });
    });
});
