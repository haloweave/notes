
import { Metadata } from 'next';
import ShareClient from './ShareClient';

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
    { searchParams }: Props
): Promise<Metadata> {
    const resolvedSearchParams = await searchParams;
    const sessionId = resolvedSearchParams.session_id as string | undefined;
    const index = resolvedSearchParams.index as string | undefined;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://huggnote.com';
    let recipientName = 'Someone Special';
    let senderName = 'Someone';
    let description = '🎁 You have received a personalized song gift! Open this magical musical experience created just for you.';

    if (sessionId) {
        try {
            // Re-using the fetch logic, adapted for server-side
            // We need absolute URL for server-side fetch
            let response = await fetch(`${baseUrl}/api/compose/forms?formId=${sessionId}`, {
                cache: 'no-store'
            });

            if (!response.ok) {
                response = await fetch(`${baseUrl}/api/compose/forms?stripeSessionId=${sessionId}`, {
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
            // Fallback to default metadata on error
        }
    }

    return {
        title: `🎁 A Gift for ${recipientName} | Huggnote`,
        description,
        openGraph: {
            type: 'website',
            locale: 'en_US',
            url: `${baseUrl}/share${sessionId ? `?session_id=${sessionId}` : ''}`,
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

export default function SharePage() {
    return <ShareClient />;
}
