import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeSync } from '@/components/ThemeSync';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Personal Space | Your Mind, Organized',
  description: 'A clean, structured, and powerful space for your daily thoughts and code.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%230ea5e9%22/><path d=%22M50 25c-11.05 0-20 8.95-20 20 0 6.13 2.76 11.62 7.12 15.34.8.69 1.28 1.71 1.28 2.77V70h23.2v-6.89c0-1.06.48-2.08 1.28-2.77C67.24 56.62 70 51.13 70 45c0-11.05-8.95-20-20-20zm-8 50h16v3.2H42V75zm2.4 6.4h11.2V83H44.4v-1.6z%22 fill=%22white%22/></svg>',
  },
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <FirebaseClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ThemeSync />
            {children}
            <Toaster />
          </ThemeProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
