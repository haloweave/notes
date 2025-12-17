/**
 * Test Email Sending
 * 
 * This is a simple test file to verify the email sending functionality.
 * Run this to test if Resend is configured correctly.
 * 
 * Usage:
 * 1. Make sure RESEND_API_KEY is set in .env.local
 * 2. Run: npx tsx test-email.ts
 */

import { sendSongDeliveryEmail } from './lib/email';

async function testEmail() {
    console.log('🧪 Testing email sending...\n');

    const testData = {
        recipientEmail: 'haloweavedev@gmail.com',
        senderName: 'Test User',
        recipientName: 'John Doe',
        songLinks: [
            {
                songNumber: 1,
                recipientName: 'John Doe',
                theme: 'Birthday',
                shareUrl: 'https://huggnote.com/play/test-task-id-123',
            },
        ],
        packageType: 'solo-serenade' as const,
    };

    console.log('📧 Sending test email to:', testData.recipientEmail);
    console.log('📝 Test data:', JSON.stringify(testData, null, 2));
    console.log('\n⏳ Sending...\n');

    const result = await sendSongDeliveryEmail(testData);

    if (result.success) {
        console.log('✅ Email sent successfully!');
        console.log('📬 Check the inbox:', testData.recipientEmail);
        console.log('📊 Response:', result.data);
    } else {
        console.error('❌ Email failed to send');
        console.error('Error:', result.error);
    }
}

// Run the test
testEmail().catch(console.error);
