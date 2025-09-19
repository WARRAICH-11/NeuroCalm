import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import { MainNav } from '@/components/main-nav';
import { AuthWrapper } from '@/components/auth/auth-wrapper';

export const metadata: Metadata = {
  title: 'NeuroCalm',
  description: 'Your Personal Neuroscience Coach. Achieve a Calmer, More Productive Brain.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" 
          rel="stylesheet" 
        />
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background" suppressHydrationWarning>
        <AuthWrapper>
          <div className="flex flex-col min-h-screen">
            <header className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center justify-between py-4">
                <div className="flex items-center space-x-4">
                  <Link href="/" className="flex items-center space-x-2">
                    <span className="font-bold text-xl">NeuroCalm</span>
                  </Link>
                </div>
                <MainNav />
              </div>
            </header>
            <main className="flex-1">
              <div className="container py-4">
                {children}
              </div>
            </main>
            <footer className="border-t py-6">
              <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                  &copy; {new Date().getFullYear()} NeuroCalm. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
          <Analytics />
        </AuthWrapper>
      </body>
    </html>
  );
}
