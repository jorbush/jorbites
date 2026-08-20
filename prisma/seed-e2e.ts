import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting E2E database seeding...');

    const testEmail = (
        process.env.CYPRESS_USER_EMAIL || 'test@jorbites.com'
    ).toLowerCase();
    const testPassword = process.env.CYPRESS_USER_PASSWORD || 'password123';
    const hashedPassword = await bcrypt.hash(testPassword, 12);

    // 1. Seed main Cypress test user
    const mainUser = await prisma.user.upsert({
        where: { email: testEmail },
        update: {
            hashedPassword,
            name: 'Cypress Test User',
            language: 'en',
        },
        create: {
            email: testEmail,
            name: 'Cypress Test User',
            hashedPassword,
            image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            level: 1,
            verified: true,
            language: 'en',
        },
    });

    console.log(`✅ Main test user seeded: ${mainUser.email}`);

    // 2. Seed collaborator chefs for collaborative recipe tests
    const chefs = [
        { name: 'Chef Maria', email: 'chef.maria@jorbites.com' },
        { name: 'Chef One', email: 'chef.one@jorbites.com' },
        { name: 'Chef Two', email: 'chef.two@jorbites.com' },
        { name: 'Chef Three', email: 'chef.three@jorbites.com' },
        { name: 'Chef Four', email: 'chef.four@jorbites.com' },
        { name: 'Chef Five', email: 'chef.five@jorbites.com' },
    ];

    for (const chef of chefs) {
        await prisma.user.upsert({
            where: { email: chef.email },
            update: {
                name: chef.name,
                hashedPassword,
            },
            create: {
                email: chef.email,
                name: chef.name,
                hashedPassword,
                image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                level: 2,
                verified: true,
                language: 'en',
            },
        });
    }

    console.log(`✅ ${chefs.length} collaborator chefs seeded.`);
    console.log('🌱 E2E database seeding complete.');
}

main()
    .catch((e) => {
        console.error('❌ E2E seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
