import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface PolicyFrontmatter {
    title: string;
    description: string;
}

export interface Policy {
    slug: string;
    frontmatter: PolicyFrontmatter;
    content: string;
    language: string;
}

/**
 * Read a single markdown file and extract frontmatter and content
 */
export function readPolicyFile(filePath: string): {
    frontmatter: PolicyFrontmatter;
    content: string;
} {
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
            frontmatter: data as PolicyFrontmatter,
            content,
        };
    } catch (error) {
        console.error(`Error reading markdown file: ${filePath}`, error);
        return {
            frontmatter: {
                title: 'Error',
                description: 'Error loading policy',
            },
            content: 'Error loading policy content.',
        };
    }
}

/**
 * Get a specific policy by slug and language
 */
export async function getPolicyBySlug(
    slug: string,
    language: string = 'en'
): Promise<Policy | null> {
    const policiesDirectory = path.join(
        process.cwd(),
        'app/content/policies',
        language
    );
    const filePath = path.join(policiesDirectory, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const { frontmatter, content } = readPolicyFile(filePath);

    return {
        slug,
        frontmatter,
        content,
        language,
    };
}
