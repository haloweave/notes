import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://huggnote.com';

    // Fetch song data to get custom title and message
    let songTitle = 'Listen to Your Bespoke Song';
    let songDescription = 'Someone created a beautiful, personalized song just for you. Click to listen to this unique musical gift.';

    try {
        const response = await fetch(`${baseUrl}/api/play/${params.slug}`, {
            cache: 'no-store'
        });

        if (response.ok) {
            const song = await response.json();
            if (song.customTitle) {
                songTitle = song.customTitle;
            } else if (song.title) {
                songTitle = song.title;
            }

            if (song.customMessage) {
                songDescription = `"${song.customMessage}" - Listen to this personalized song created with Huggnote.`;
            }
        }
    } catch (error) {
        console.error('Error fetching song metadata:', error);
    }

    return {
        title: `${songTitle} | Huggnote`,
        description: songDescription,
        openGraph: {
            type: 'music.song',
            locale: 'en_US',
            url: `${baseUrl}/play/${params.slug}`,
            title: songTitle,
            description: songDescription,
            siteName: 'Huggnote',
            images: [
                {
                    url: `${baseUrl}/gift-sharing-og.png`,
                    width: 1200,
                    height: 630,
                    alt: 'Huggnote - Bespoke Song Gift',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: songTitle,
            description: songDescription,
            images: [`${baseUrl}/gift-sharing-og.png`],
        },
    };
}

export default function PlayLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
