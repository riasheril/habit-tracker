import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/navigation';
import LayoutWrapper from '@/components/layout-wrapper';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'One Thing a Day',
  description: 'Build better habits, one day at a time',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Navigation />
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
