import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Blog, BlogFrontmatter } from '@/app/utils/markdownUtils';

/**
 * Read a single markdown file and extract frontmatter and content
 */
export function readBlogFile(filePath: string): {
    frontmatter: BlogFrontmatter;
    content: string;
} {
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
            frontmatter: data as BlogFrontmatter,
            content,
        };
    } catch (error) {
        console.error(`Error reading markdown file: ${filePath}`, error);
        return {
            frontmatter: {
                title: 'Error',
                user_id: '',
                date: new Date().toISOString(),
                image: '/avocado.webp',
                description: 'Error loading blog post',
            },
            content: 'Error loading blog content.',
        };
    }
}

/**
 * Get a specific blog by id and language
 * If not found in specified language, tries all languages
 */
export async function getBlogById(
    id: string,
    language: string = 'en'
): Promise<Blog | null> {
    const languages = [language, 'en', 'es', 'ca'].filter(
        (lang, index, self) => self.indexOf(lang) === index
    );

    for (const lang of languages) {
        const blogsDirectory = path.join(
            process.cwd(),
            'app/content/blogs',
            lang
        );
        const filePath = path.join(blogsDirectory, `${id}.md`);

        if (fs.existsSync(filePath)) {
            const { frontmatter, content } = readBlogFile(filePath);

            return {
                id,
                slug: id,
                frontmatter,
                content,
                language: lang,
            };
        }
    }

    return null;
}

/**
 * Get all blogs for a specific language, sorted by date (newest first)
 */
export async function getAllBlogs(language: string = 'en'): Promise<Blog[]> {
    const blogsDirectory = path.join(
        process.cwd(),
        'app/content/blogs',
        language
    );

    // Check if directory exists
    if (!fs.existsSync(blogsDirectory)) {
        return [];
    }

    try {
        const filenames = fs.readdirSync(blogsDirectory);
        const markdownFiles = filenames.filter((file) => file.endsWith('.md'));

        const blogs = markdownFiles.map((filename) => {
            const filePath = path.join(blogsDirectory, filename);
            const { frontmatter, content } = readBlogFile(filePath);
            const id = filename.replace('.md', '');

            return {
                id,
                slug: id,
                frontmatter,
                content,
                language,
            };
        });

        // Sort by date (newest first)
        return blogs.sort((a, b) => {
            const dateA = new Date(a.frontmatter.date).getTime();
            const dateB = new Date(b.frontmatter.date).getTime();
            return dateB - dateA;
        });
    } catch (error) {
        console.error(
            `Error reading blogs directory: ${blogsDirectory}`,
            error
        );
        return [];
    }
}

/**
 * Get paginated blogs
 */
export async function getPaginatedBlogs(
    language: string = 'en',
    page: number = 1,
    pageSize: number = 10
): Promise<{
    blogs: Blog[];
    total: number;
    totalPages: number;
    currentPage: number;
}> {
    const allBlogs = await getAllBlogs(language);
    const total = allBlogs.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const blogs = allBlogs.slice(startIndex, endIndex);

    return {
        blogs,
        total,
        totalPages,
        currentPage: page,
    };
}
