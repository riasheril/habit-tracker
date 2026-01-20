'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useAuth } from '@clerk/nextjs';

export default function Navigation() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  const isActive = (path: string) => pathname === path;

  // Don't show navigation on auth pages
  const isAuthPage = pathname?.startsWith('/sign-in') ||
                     pathname?.startsWith('/sign-up') ||
                     pathname?.startsWith('/onboarding');

  if (isAuthPage || !isSignedIn) {
    return null;
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:flex-col md:bg-white md:border-r md:border-gray-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">Habit Tracker</h1>
        </div>
        <div className="flex-1 px-4">
          <Link
            href="/home"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              isActive('/home')
                ? 'bg-emerald-50 text-emerald-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl">🏠</span>
            <span>Home</span>
          </Link>
          <Link
            href="/stats"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/stats')
                ? 'bg-emerald-50 text-emerald-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-2xl">📊</span>
            <span>Stats</span>
          </Link>
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10'
                }
              }}
            />
            <span className="text-sm text-gray-600">Account</span>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center h-16">
          <Link
            href="/home"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/home')
                ? 'text-emerald-700'
                : 'text-gray-600'
            }`}
          >
            <span className="text-2xl mb-1">🏠</span>
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            href="/stats"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isActive('/stats')
                ? 'text-emerald-700'
                : 'text-gray-600'
            }`}
          >
            <span className="text-2xl mb-1">📊</span>
            <span className="text-xs font-medium">Stats</span>
          </Link>
          <div className="flex flex-col items-center justify-center flex-1 h-full text-gray-600">
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8'
                }
              }}
            />
            <span className="text-xs font-medium mt-1">Account</span>
          </div>
        </div>
      </nav>
    </>
  );
}
