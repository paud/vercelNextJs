import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: "中古品",
    short_name: "中古品",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#faf7fb",
    description: "This is a 2nd hand trade platform Progressive Web Application.",
    icons: [
      {
        src: "/icons/icon@192.png",
        type: "image/png",
        sizes: "192x192",
        purpose: "any"
      },
      {
        src: "/icons/icon@512.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "any"
      }
    ],
    screenshots: [
      {
        src: "/screenshots/mobile-1.jpg",
        sizes: "551x979",
        type: "image/jpeg"
      },
      {
        src: "/screenshots/mobile-2.jpg",
        sizes: "518x922",
        type: "image/jpeg",
        form_factor: "narrow"
      },
      {
        src: "/screenshots/mobile-3.jpg",
        sizes: "518x922",
        type: "image/jpeg",
        form_factor: "narrow"
      },
      {
        src: "/screenshots/tablet-1.jpg",
        sizes: "1270x800",
        type: "image/jpeg",
        form_factor: "wide"
      },
      {
        src: "/screenshots/tablet-2.jpg",
        sizes: "1270x800",
        type: "image/jpeg",
        form_factor: "wide"
      }
    ]
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
