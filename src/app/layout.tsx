import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeSync } from '@/components/ThemeSync';

export const metadata: Metadata = {
  title: 'NoteWave | Minimalist Notes',
  description: 'A clean, simple, and powerful note-taking app for your daily thoughts.',
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
          <ThemeSync />
          {children}
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
