// Test script for compose forms API
const BASE_URL = 'http://localhost:3000';

async function testComposeFormsAPI() {
    console.log('🧪 Testing Compose Forms API...\n');

    const testFormId = `form_${Date.now()}_test`;

    // Test 1: Create a form
    console.log('1️⃣  Creating form...');
    const createResponse = await fetch(`${BASE_URL}/api/compose/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            formId: testFormId,
            packageType: 'solo-serenade',
            songCount: 1,
            formData: {
                recipientName: 'Test User',
                relationship: 'friend',
                theme: 'birthday',
                senderName: 'Tester',
                senderEmail: 'test@example.com'
            },
            generatedPrompts: ['Test prompt for birthday song']
        })
    });

    const createResult = await createResponse.json();
    console.log('✅ Create result:', createResult.success ? 'SUCCESS' : 'FAILED');
    console.log('   Form ID:', createResult.form?.id);
    console.log('   Status:', createResult.form?.status);
    console.log('');

    // Test 2: Get the form
    console.log('2️⃣  Fetching form...');
    const getResponse = await fetch(`${BASE_URL}/api/compose/forms?formId=${testFormId}`);
    const getResult = await getResponse.json();
    console.log('✅ Get result:', getResult.success ? 'SUCCESS' : 'FAILED');
    console.log('   Package type:', getResult.form?.packageType);
    console.log('');

    // Test 3: Update with variation task IDs
    console.log('3️⃣  Updating with variation task IDs...');
    const updateResponse = await fetch(`${BASE_URL}/api/compose/forms`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            formId: testFormId,
            variationTaskIds: {
                "0": ["task_1", "task_2", "task_3"]
            },
            status: 'variations_generating'
        })
    });

    const updateResult = await updateResponse.json();
    console.log('✅ Update result:', updateResult.success ? 'SUCCESS' : 'FAILED');
    console.log('   New status:', updateResult.form?.status);
    console.log('   Task IDs:', updateResult.form?.variationTaskIds);
    console.log('');

    // Test 4: Update with audio URLs
    console.log('4️⃣  Updating with audio URLs...');
    const audioUpdateResponse = await fetch(`${BASE_URL}/api/compose/forms`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            formId: testFormId,
            variationAudioUrls: {
                "0": {
                    "1": "https://example.com/audio1.mp3",
                    "2": "https://example.com/audio2.mp3",
                    "3": "https://example.com/audio3.mp3"
                }
            },
            status: 'variations_ready'
        })
    });

    const audioUpdateResult = await audioUpdateResponse.json();
    console.log('✅ Audio update result:', audioUpdateResult.success ? 'SUCCESS' : 'FAILED');
    console.log('   New status:', audioUpdateResult.form?.status);
    console.log('');

    console.log('🎉 All tests completed!');
}

testComposeFormsAPI().catch(console.error);
