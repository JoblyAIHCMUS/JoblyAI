'use client';
import { MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KeyboardEvent } from 'react';
import { useState, useEffect } from 'react';
import { LocationAutocomplete } from '@/components/ui/LocationAutocomplete';

interface FindJobsHeroSectionProps {
  searchTerm?: string;
  location?: string;
  setSearchTerm?: (term: string) => void;
  setLocation?: (location: string) => void;
  placeholder?: string;
}

export default function FindJobsHeroSection({
  searchTerm,
  location,
  setSearchTerm,
  setLocation,
  placeholder,
}: FindJobsHeroSectionProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');
  const [localLocation, setLocalLocation] = useState(location || '');

  // Sync local state when props change
  useEffect(() => {
    setLocalSearchTerm(searchTerm || '');
  }, [searchTerm]);

  useEffect(() => {
    setLocalLocation(location || '');
  }, [location]);

  const handleSearch = () => {
    setSearchTerm?.(localSearchTerm || '');
    setLocation?.(localLocation || '');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="relative isolate z-0 bg-[#F8F8FD] before:pointer-events-none before:absolute before:left-0 before:top-[85px] before:z-0 before:hidden before:h-[calc(100%-85px)] before:w-[244px] before:bg-[url('https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/assets/public/landing/Pattern.svg')] before:bg-[length:834px_436px] before:bg-right-top before:bg-no-repeat before:opacity-90 before:content-[''] after:pointer-events-none after:absolute after:right-0 after:top-[85px] after:z-0 after:hidden after:h-[calc(100%-85px)] after:w-[244px] after:bg-[url('https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/assets/public/landing/Pattern.svg')] after:bg-[length:834px_436px] after:bg-no-repeat after:opacity-90 after:content-[''] after:[background-position:43%_top] lg:before:block lg:after:block">
      <div className="relative z-10 mx-auto flex w-full flex-col items-center gap-10 px-4 pb-12 pt-28 sm:px-6 lg:px-8 lg:pb-16 lg:pt-36">
        <div className="flex w-full flex-col gap-4">
          <div className="rounded-[5px] bg-white p-4 shadow-[0px_2.713px_4.397px_rgba(192,192,192,0.03),0px_6.863px_11.119px_rgba(192,192,192,0.04),0px_13.999px_22.683px_rgba(192,192,192,0.05),0px_28.836px_46.722px_rgba(192,192,192,0.06),0px_79px_128px_rgba(192,192,192,0.09)] sm:p-6">
            <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center lg:gap-5">
              <div className="flex flex-1 items-center gap-4 px-2 sm:px-4">
                <Search className="h-6 w-6 text-slate-900" />
                <div className="flex flex-1 flex-col gap-2 pt-2.5">
                  <input
                    type="text"
                    placeholder={placeholder || 'Job title or keyword'}
                    className="w-full border-none bg-transparent p-0 text-base leading-6 text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <div className="h-px w-full bg-slate-300" />
                </div>
              </div>

              <div className="hidden h-14 w-px bg-slate-300 lg:block" />

              <div className="flex flex-1 items-center gap-4 px-2 sm:px-4">
                <MapPin className="h-6 w-6 text-slate-900" />
                <div className="flex flex-1 flex-col gap-2 pt-2.5">
                  <LocationAutocomplete
                    value={localLocation}
                    onChange={(loc) =>
                      setLocalLocation(loc?.formattedAddress || '')
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Location"
                    hideIcon={true}
                    className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 [&>div>input]:border-none [&>div>input]:shadow-none [&>div>input]:bg-transparent [&>div>input]:p-0 [&>div>input]:h-auto [&>div>input]:text-base [&>div>input]:leading-6 [&>div>input]:text-slate-900 [&>div>input]:placeholder:text-slate-400 [&>div>input]:focus-visible:ring-0 [&>div>input]:focus-visible:ring-offset-0 [&>div>button]:right-0"
                    inputClassName="border-none shadow-none bg-transparent p-0 text-base leading-6 text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                  />
                  <div className="h-px w-full bg-slate-300" />
                </div>
              </div>

              <Button
                className="h-12 rounded-[5px] bg-indigo-600 px-6 text-base font-semibold leading-[22px] text-white hover:bg-indigo-700"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>
          </div>

          <p className="text-center text-base font-normal leading-6 text-slate-600 opacity-70 lg:text-left">
            Popular : UI Designer, UX Researcher, Android, Admin
          </p>
        </div>
      </div>
    </section>
  );
}
