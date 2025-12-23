'use client';

import { useEffect } from "react";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { initMixpanel } from "@/lib/mixpanelClient";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    initMixpanel(); // Initialize Mixpanel with autocapture enabled
  }, []);

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet" />
        <title>Huggnote — Custom Holiday Songs</title>
        <meta name="description" content="Turn your memories into a custom holiday song. Delivered as a magical, interactive experience with snow, hearts, and music." />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content="/" />
        <meta property="og:title" content="Huggnote — Custom Holiday Songs" />
        <meta property="og:description" content="Turn your memories into a custom holiday song. Delivered as a magical, interactive experience with snow, hearts, and music." />
        <meta property="og:site_name" content="Huggnote" />
        <meta property="og:image" content="/metaImage.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Huggnote - Custom Holiday Songs" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Huggnote — Custom Holiday Songs" />
        <meta name="twitter:description" content="Turn your memories into a custom holiday song. Delivered as a magical, interactive experience with snow, hearts, and music." />
        <meta name="twitter:image" content="/metaImage.png" />
      </head>
      <body className={`${inter.variable} ${lora.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
