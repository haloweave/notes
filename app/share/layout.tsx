import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Share Your Song | Huggnote',
    description: 'Share your bespoke musical gift with loved ones.',
};

export default function ShareLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
