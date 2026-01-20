'use client';

import { useAuth } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();

  // Check if we're on an auth page
  const isAuthPage = pathname?.startsWith('/sign-in') ||
                     pathname?.startsWith('/sign-up') ||
                     pathname?.startsWith('/onboarding');

  // Apply padding only when navigation is visible (signed in and not on auth pages)
  const shouldShowNavigation = isSignedIn && !isAuthPage;

  return (
    <main className={shouldShowNavigation ? 'min-h-screen md:pl-64 pb-16 md:pb-0' : 'min-h-screen'}>
      {children}
    </main>
  );
}
