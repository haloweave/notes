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
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Bespoke Huggnote</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', 'Times New Roman', serif; background-color: #2c4a6b;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #2c4a6b; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 0; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);">

                    <!-- Header with Logo -->
                    <tr>
                        <td style="background-color: #2c4a6b; padding: 50px 40px; text-align: center;">
                            <div style="margin-bottom: 15px;">
                                <h1 style="margin: 0; color: #F5E6B8; font-size: 36px; font-weight: 300; letter-spacing: 2px;">huggnōte</h1>
                                <p style="margin: 5px 0 0 0; color: #F5E6B8; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">BESPOKE</p>
                            </div>
                            <p style="margin: 0; color: #F5E6B8; font-size: 15px; letter-spacing: 1px; font-style: italic;">
                                Bespoke Songs... Giftwrapped in Emotion
                            </p>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 50px; background-color: #F8F6F0;">
                            <p style="margin: 0 0 30px 0; color: #2c4a6b; font-size: 16px; line-height: 1.6;">
                                Dear <strong>${senderName}</strong>,
                            </p>

                            <h2 style="margin: 0 0 25px 0; color: #2c4a6b; font-size: 22px; font-weight: 600; line-height: 1.4;">
                                We are delighted to present your bespoke Huggnote${!isSingle ? 's' : ''} for <span style="color: #87CEEB;">${songLinks[0].recipientName}</span>
                            </h2>

                            <p style="margin: 0 0 35px 0; color: #2c4a6b; font-size: 15px; line-height: 1.7;">
                                Your personalised ${isSingle ? 'song has' : 'songs have'} been carefully created and ${isSingle ? 'is' : 'are'} now ready to share. ${isSingle ? 'This unique musical gift has' : 'These unique musical gifts have'} been thoughtfully crafted to capture the sentiment you wished to convey.
                            </p>

                            ${songLinks.map((song, index) => `
                            <!-- CTA Button ${index + 1} -->
                            <div style="text-align: left; margin: ${index > 0 ? '30px' : '40px'} 0;">
                                ${!isSingle ? `<p style="margin: 0 0 10px 0; color: #7a7a7a; font-size: 13px; font-weight: 600;">Song ${song.songNumber} - ${song.theme}</p>` : ''}
                                <a href="${song.shareUrl}"
                                   target="_blank"
                                   style="display: inline-block; background-color: #2c4a6b; color: #ffffff; padding: 16px 50px; text-decoration: none; font-weight: 600; font-size: 15px; letter-spacing: 1px; border-radius: 0; box-shadow: 0 4px 12px rgba(44, 74, 107, 0.3); text-transform: uppercase;">
                                    ${isSingle ? 'ACCESS YOUR SONG' : `ACCESS SONG ${song.songNumber}`}
                                </a>
                            </div>
                            `).join('')}

                            <p style="margin: 15px 0 0 0; color: #5a6f87; font-size: 13px; line-height: 1.6; text-align: left; font-style: italic;">
                                Simply click the button${!isSingle ? 's' : ''} above to experience your bespoke creation${!isSingle ? 's' : ''}
                            </p>

                            <p style="margin: 20px 0 0 0; color: #2c4a6b; font-size: 14px; line-height: 1.6;">
                                Once accessed, you'll be able to preview your ${isSingle ? 'song' : 'songs'} and share ${isSingle ? 'it' : 'them'} with <span style="color: #87CEEB; font-weight: 600;">${songLinks[0].recipientName}</span> using your unique gift link${!isSingle ? 's' : ''}.
                            </p>

                            <!-- Order Details Inside Cream Section -->
                            <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #d5d0c5;">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td style="padding: 8px 0; color: #7a7a7a; font-size: 13px;">Package Type</td>
                                        <td style="padding: 8px 0; color: #2c4a6b; font-size: 13px; text-align: right; font-weight: 600;">${packageType === 'holiday-hamper' ? 'Merry Medley Bundle' : 'Solo Serenade'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #7a7a7a; font-size: 13px;">${isSingle ? 'Song' : 'Songs'} Delivered</td>
                                        <td style="padding: 8px 0; color: #87CEEB; font-size: 13px; text-align: right; font-weight: 600;">${songLinks.length} ${isSingle ? 'Song' : 'Songs'}</td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 35px 50px; background-color: #2c4a6b; text-align: center;">
                            <p style="margin: 0 0 15px 0; color: #F5E6B8; font-size: 18px; font-weight: 300; letter-spacing: 1px;">
                                Huggnote
                            </p>
                            <p style="margin: 0 0 8px 0; color: #F5E6B8; font-size: 13px; line-height: 1.5; font-style: italic;">
                                Thank you for choosing Huggnote for your bespoke musical gift.
                            </p>
                            <p style="margin: 15px 0 0 0; color: #a0b8d0; font-size: 12px; line-height: 1.5;">
                                Questions? Contact us at
                                <a href="mailto:vips@huggnote.com" style="color: #87CEEB; text-decoration: none;">vips@huggnote.com</a>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
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
        console.log('[RESEND] From: Huggnote <noreply@huggnotebespoke.com>');
        console.log('[RESEND] To:', recipientEmail);
        console.log('[RESEND] Subject:', subject);
        console.log('[RESEND] Song links count:', songLinks.length);
        console.log('[RESEND] HTML content length:', htmlContent.length, 'characters');
        console.log('[RESEND] Text content length:', textContent.length, 'characters');

        const response = await resend.emails.send({
            // Using verified domain huggnotebespoke.com
            from: 'Huggnote <noreply@huggnotebespoke.com>',
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
