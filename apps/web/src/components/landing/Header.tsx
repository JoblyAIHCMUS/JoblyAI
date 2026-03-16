'use client';

import { Button } from '@/components/ui/button';
import { Menu, X, Search } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function isPathActive(pathname: string, basePath: string): boolean {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isFindJobsActive = isPathActive(pathname, '/find-jobs');

  const isBrowseCompaniesActive = isPathActive(pathname, '/browse-companies');

  return (
    <>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="lg:hidden fixed top-0 left-0 bottom-0 w-[80vw] max-w-sm bg-white z-[70] p-4 md:p-6 flex flex-col gap-6 md:gap-8 overflow-y-auto">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 bg-indigo-700 rounded-full relative flex items-center justify-center flex-shrink-0">
                  <Search className="w-5 h-5 text-white rotate-90" />
                </div>
                <span className="text-slate-900 text-lg md:text-xl font-semibold truncate">
                  JoblyAI
                </span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-slate-100 rounded flex-shrink-0"
              >
                <X className="w-6 h-6 text-slate-900" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                href="/find-jobs"
                className={`flex flex-col items-start gap-1 font-semibold text-base transition-colors ${
                  isFindJobsActive
                    ? 'text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>Browse Jobs</span>
                <span
                  className={`h-[2px] w-full bg-indigo-600 transition-opacity ${
                    isFindJobsActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </Link>
              <Link
                href="/browse-companies"
                className={`flex flex-col items-start gap-1 font-semibold text-base transition-colors ${
                  isBrowseCompaniesActive
                    ? 'text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>Browse Companies</span>
                <span
                  className={`h-[2px] w-full bg-indigo-600 transition-opacity ${
                    isBrowseCompaniesActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </Link>
            </div>

            <div className="border-t border-slate-300" />

            <div className="flex flex-col gap-4">
              <Link href="/signup" className="w-full">
                <Button className="w-full bg-indigo-600 text-white py-3 hover:bg-indigo-700 font-semibold">
                  Sign Up
                </Button>
              </Link>
              <Link href="/login" className="w-full">
                <Button
                  variant="outline"
                  className="w-full py-3 border-slate-300 text-indigo-600 font-semibold"
                >
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}

      <header className="fixed top-0 left-0 right-0 bg-indigo-50 border-b border-slate-200 z-50 overflow-hidden box-border">
        {/* Mobile Header */}
        <div className="lg:hidden px-2 sm:px-3 py-3 flex items-center gap-1.5 sm:gap-2 box-border w-full">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1 bg-white rounded-full border border-slate-300 hover:bg-slate-50 flex-shrink-0"
          >
            <Menu className="w-4 h-4 text-slate-900" />
          </button>
          <div className="flex items-center gap-1 min-w-0 flex-shrink-0">
            <div className="w-6 h-6 bg-indigo-700 rounded-full flex items-center justify-center flex-shrink-0">
              <Search className="w-3 h-3 text-white rotate-90" />
            </div>
            <span className="text-slate-900 text-xs sm:text-sm font-semibold truncate">
              JoblyAI
            </span>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4 justify-between items-center">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-2xl font-bold text-slate-900">JoblyAI</span>
            </div>
            <nav className="flex items-center gap-8">
              <Link
                href="/find-jobs"
                className={`border-b-2 pb-1 text-sm font-medium transition-colors ${
                  isFindJobsActive
                    ? 'border-indigo-600 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>Find Jobs</span>
                <span
                  className={`h-[2px] w-full bg-indigo-600 transition-opacity ${
                    isFindJobsActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </Link>
              <Link
                href="/browse-companies"
                className={`border-b-2 pb-1 text-sm font-medium transition-colors ${
                  isBrowseCompaniesActive
                    ? 'border-indigo-600 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>Browse Companies</span>
                <span
                  className={`h-[2px] w-full bg-indigo-600 transition-opacity ${
                    isBrowseCompaniesActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-indigo-600 px-6 py-2 text-sm font-semibold hover:text-indigo-700">
              Login
            </Link>
            <div className="w-px h-6 bg-slate-300"></div>
            <Link href="/signup">
              <Button className="bg-indigo-600 text-white px-6 py-2 text-sm font-semibold hover:bg-indigo-700">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
