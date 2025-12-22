'use client';

import Image from 'next/image';

export default function PlaceholderPage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Full screen GIF using Next.js Image */}
      <Image
        src="/placeholder.gif"
        alt="Placeholder"
        fill
        className="object-cover"
        priority
        unoptimized // Important for GIFs to preserve animation
        quality={100}
      />
    </div>
  );
}
