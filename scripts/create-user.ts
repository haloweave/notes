import { auth } from '../lib/auth';

async function createTestUser() {
    console.log('Creating test user...');

    try {
        // This will use Better Auth's internal user creation
        const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
        const result = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'example123',
                name: 'Test User',
            }),
        });

        const data = await result.json();
        console.log('Result:', data);

        if (result.ok) {
            console.log('✅ Test user created successfully!');
        } else {
            console.error('❌ Failed to create user:', data);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

createTestUser();
