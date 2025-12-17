import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SongEmailData {
    recipientEmail: string;
    senderName: string;
    recipientName: string;
    songLinks: Array<{
        songNumber: number;
        recipientName: string;
        theme: string;
        shareUrl: string;
    }>;
    packageType: 'solo-serenade' | 'holiday-hamper';
}

export async function sendSongDeliveryEmail(data: SongEmailData) {
    const { recipientEmail, senderName, songLinks, packageType } = data;

    const isSingle = packageType === 'solo-serenade';
    const subject = isSingle
        ? `🎵 Your Custom Song is Ready!`
        : `🎵 Your ${songLinks.length} Custom Songs are Ready!`;

    // Build the song links HTML
    const songLinksHtml = songLinks.map((song) => `
        <div style="margin: 20px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
            <h3 style="color: #ffffff; margin: 0 0 10px 0; font-size: 18px;">
                ${isSingle ? 'Your Song' : `Song ${song.songNumber}`}
            </h3>
            <p style="color: #e8dcc0; margin: 0 0 15px 0; font-size: 14px;">
                For ${song.recipientName} • ${song.theme}
            </p>
            <a href="${song.shareUrl}" 
               style="display: inline-block; padding: 12px 30px; background: #F5E6B8; color: #1a3d5f; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                🎧 Listen Now
            </a>
        </div>
    `).join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            -webkit-font-smoothing: antialiased;
        }
        .email-wrapper {
            width: 100%;
            background-color: #f5f5f5;
            padding: 40px 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #1a3d5f 0%, #2d5a7b 100%);
            padding: 60px 40px;
            text-align: center;
            color: #ffffff;
        }
        .brand-mark {
            font-size: 48px;
            margin-bottom: 16px;
        }
        .header-eyebrow {
            font-size: 12px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #F5E6B8;
            margin: 0 0 16px 0;
            font-weight: 500;
        }
        .header-title {
            font-size: 42px;
            font-weight: 300;
            line-height: 1.2;
            margin: 0 0 16px 0;
            color: #F5E6B8;
        }
        .header-subtitle {
            font-size: 16px;
            color: rgba(245, 230, 184, 0.8);
            margin: 0;
            font-weight: 300;
        }
        .content {
            padding: 40px;
        }
        .text-block {
            font-size: 16px;
            line-height: 1.6;
            color: #333333;
            margin: 0 0 20px 0;
        }
        .recipient-block {
            text-align: center;
            padding: 40px 0;
            margin: 30px 0;
        }
        .recipient-label {
            font-size: 12px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #999999;
            margin: 0 0 12px 0;
        }
        .recipient-name {
            font-size: 36px;
            font-weight: 300;
            color: #1a3d5f;
            margin: 0 0 20px 0;
        }
        .recipient-decoration {
            width: 60px;
            height: 2px;
            background: linear-gradient(90deg, transparent, #F5E6B8, transparent);
            margin: 0 auto;
        }
        .cta-section {
            text-align: center;
            margin: 40px 0;
        }
        .cta-button {
            display: inline-block;
            padding: 16px 48px;
            background: linear-gradient(135deg, #F5E6B8 0%, #d4c89a 100%);
            color: #1a3d5f;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(245, 230, 184, 0.3);
        }
        .spacer {
            height: 30px;
        }
        .features-list {
            list-style: none;
            padding: 0;
            margin: 30px 0;
        }
        .features-list li {
            padding: 12px 0 12px 32px;
            position: relative;
            font-size: 15px;
            color: #555555;
            line-height: 1.5;
        }
        .features-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #F5E6B8;
            font-weight: bold;
            font-size: 18px;
        }
        .info-rows {
            border-top: 1px solid #e0e0e0;
            border-bottom: 1px solid #e0e0e0;
            padding: 20px 0;
            margin: 30px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
        }
        .info-row-label {
            font-size: 14px;
            color: #999999;
            margin: 0;
        }
        .info-row-value {
            font-size: 14px;
            color: #333333;
            font-weight: 500;
            margin: 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 40px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
        }
        .footer-title {
            font-size: 18px;
            font-weight: 600;
            color: #1a3d5f;
            margin: 0 0 16px 0;
        }
        .footer-text {
            font-size: 14px;
            color: #666666;
            margin: 0 0 12px 0;
            line-height: 1.6;
        }
        .footer-link {
            color: #1a3d5f;
            text-decoration: none;
        }
        .footer-legal {
            font-size: 12px;
            color: #999999;
            margin: 20px 0 0 0;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            
            <!-- Header -->
            <div class="header">
                <div class="brand-mark">🎁</div>
                <p class="header-eyebrow">Huggnote</p>
                <h1 class="header-title">Your Song<br>is Ready</h1>
                <p class="header-subtitle">A bespoke musical gift, crafted with care</p>
            </div>

            <!-- Content -->
            <div class="content">
                <p class="text-block">
                    Dear <strong>${senderName}</strong>,
                </p>

                <p class="text-block">
                    We're delighted to inform you that your custom ${isSingle ? 'song has' : 'songs have'} been completed. 
                    Every note has been carefully composed to create a truly personal and meaningful gift.
                </p>

                <!-- Recipient -->
                <div class="recipient-block">
                    <p class="recipient-label">For</p>
                    <h2 class="recipient-name">${songLinks[0].recipientName}</h2>
                    <div class="recipient-decoration"></div>
                </div>

                <!-- Song Links -->
                ${songLinks.map((song, index) => `
                    <div class="cta-section">
                        <a href="${song.shareUrl}" class="cta-button">
                            ${isSingle ? 'Access Your Song' : `Access Song ${song.songNumber}`}
                        </a>
                    </div>
                    ${index < songLinks.length - 1 ? '<div class="spacer"></div>' : ''}
                `).join('')}

                <div class="spacer"></div>

                <!-- Features -->
                <ul class="features-list">
                    <li>Your professionally crafted personalized song</li>
                    <li>Beautiful animated gift box presentation</li>
                    <li>Unique shareable link for ${songLinks[0].recipientName}</li>
                    <li>Magical snow and heart animations</li>
                    <li>High-quality audio for keepsake</li>
                </ul>

                <div class="spacer"></div>

                <p class="text-block">
                    Click the button above to access your ${isSingle ? 'song' : 'songs'}. 
                    When you're ready, share ${isSingle ? 'it' : 'them'} with ${songLinks[0].recipientName} and create an unforgettable moment.
                </p>

            </div>

            <!-- Footer -->
            <div class="footer">
                <p class="footer-title">Huggnote</p>
                <p class="footer-text">
                    Thank you for choosing Huggnote for your musical gift.
                </p>
                <p class="footer-text">
                    Questions? Contact us at<br>
                    <a href="mailto:support@huggnote.com" class="footer-link">support@huggnote.com</a>
                </p>
                <p class="footer-legal">
                    © ${new Date().getFullYear()} Huggnote. All rights reserved.<br>
                    Creating bespoke musical moments, one song at a time.
                </p>
            </div>

        </div>
    </div>
</body>
</html>
    `;

    const textContent = `
Your Custom ${isSingle ? 'Song' : 'Songs'} ${isSingle ? 'is' : 'are'} Ready!

Hi ${senderName},

Great news! Your custom AI-generated ${isSingle ? 'song has' : 'songs have'} been created and ${isSingle ? 'is' : 'are'} ready to share.

${songLinks.map((song) => `
${isSingle ? 'Your Song' : `Song ${song.songNumber}`}
For ${song.recipientName} • ${song.theme}
Listen: ${song.shareUrl}
`).join('\n')}

Thank you for choosing Huggnote to create something special! 🎵

With love,
The Huggnote Team

© ${new Date().getFullYear()} Huggnote. All rights reserved.
    `.trim();

    try {
        console.log('[RESEND] 📧 Preparing to send email via Resend API...');
        console.log('[RESEND] From: Resend Onboarding (for testing)');
        console.log('[RESEND] To:', recipientEmail);
        console.log('[RESEND] Subject:', subject);
        console.log('[RESEND] Song links count:', songLinks.length);
        console.log('[RESEND] HTML content length:', htmlContent.length, 'characters');
        console.log('[RESEND] Text content length:', textContent.length, 'characters');

        const response = await resend.emails.send({
            // Use onboarding email for testing (no domain verification needed)
            // Change to 'Huggnote <noreply@huggnote.com>' after domain verification
            from: 'Resend Onboarding <onboarding@resend.dev>',
            to: [recipientEmail],
            subject: subject,
            html: htmlContent,
            text: textContent,
        });

        console.log('[RESEND] Response:', JSON.stringify(response, null, 2));

        // Check if response has error
        if (response.error) {
            console.error('[RESEND] ❌ Email failed!');
            console.error('[RESEND] Error:', response.error);
            return { success: false, error: response.error };
        }

        console.log('[RESEND] ✅ Email sent successfully!');
        console.log('[RESEND] Email ID:', response.data?.id);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('[RESEND] ❌ Failed to send email (exception)');
        console.error('[RESEND] Error type:', (error as Error).name);
        console.error('[RESEND] Error message:', (error as Error).message);
        console.error('[RESEND] Full error:', error);
        console.error('[RESEND] Stack trace:', (error as Error).stack);
        return { success: false, error };
    }
}
