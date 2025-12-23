import { Metadata } from 'next';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ session_id?: string; index?: string }> }): Promise<Metadata> {
    const { session_id, index } = (await searchParams) || {};
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://huggnote.com';

    let recipientName = 'Someone Special';
    let senderName = 'Someone';
    let description = '🎁 You have received a personalized song gift! Open this magical musical experience created just for you.';

    // Try to fetch form data if session_id is available
    if (session_id) {
        try {
            // Try fetching by formId first
            let response = await fetch(`${baseUrl}/api/compose/forms?formId=${session_id}`, {
                cache: 'no-store'
            });

            // If not found, try stripeSessionId
            if (!response.ok) {
                response = await fetch(`${baseUrl}/api/compose/forms?stripeSessionId=${session_id}`, {
                    cache: 'no-store'
                });
            }

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.form) {
                    const formData = data.form.formData;
                    const songIndex = index ? parseInt(index, 10) : 0;

                    if (formData?.recipientName) {
                        recipientName = formData.recipientName;
                    } else if (formData?.songs?.[songIndex]?.recipientName) {
                        recipientName = formData.songs[songIndex].recipientName;
                    }

                    if (formData?.senderName) {
                        senderName = formData.senderName;
                    }

                    description = `🎁 ${recipientName}, ${senderName} has created a beautiful personalized song just for you! Open this magical gift now.`;
                }
            }
        } catch (error) {
            console.error('Error fetching share metadata:', error);
        }
    }

    return {
        title: `🎁 A Gift for ${recipientName} | Huggnote`,
        description,
        openGraph: {
            type: 'website',
            locale: 'en_US',
            url: `${baseUrl}/share${session_id ? `?session_id=${session_id}` : ''}`,
            title: `🎁 ${senderName} sent you a personalized song!`,
            description,
            siteName: 'Huggnote',
            images: [
                {
                    url: `${baseUrl}/gift-sharing-og.png`,
                    width: 1200,
                    height: 630,
                    alt: 'Huggnote - Your Personalized Song Gift Awaits',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `🎁 ${senderName} sent you a personalized song!`,
            description,
            images: [`${baseUrl}/gift-sharing-og.png`],
        },
    };
}

export default function ShareLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
