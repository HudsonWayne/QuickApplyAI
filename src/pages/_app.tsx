// src/app/layout.tsx
import "@/styles/globals.css";
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'QuickApply - Find Your Next Job Fast',
  description: 'Fast-track your job applications with QuickApply.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-white text-gray-900">{children}</main>
      </body>
    </html>
  );
}
