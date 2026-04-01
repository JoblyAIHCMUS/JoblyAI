import { ChevronDown, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="relative bg-indigo-50 min-h-screen flex items-center overflow-hidden">
      {/* Decorative Pattern Background - Bottom Right */}
      <div className="absolute bottom-0 right-0 w-full max-w-7xl pointer-events-none">
        <div className="relative w-full h-full flex justify-end items-end">
          <Image
            src="https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/assets/public/landing/Pattern.svg"
            alt="decorative pattern"
            width={900}
            height={600}
            className="object-contain opacity-70 w-[500px] sm:w-[650px] lg:w-[800px] xl:w-[900px] max-w-full"
          />
          {/* <Image
            src="https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/assets/public/landing/hero-image.png"
            alt="Job seeker professional"
            width={500}
            height={600}
            className="object-contain absolute bottom-0 right-0 z-10 hidden lg:block"
            priority
          /> */}
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-12 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 max-w-7xl mx-auto w-full relative z-10">
        {/* Main Content */}
        <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
            Discover more than{' '}
            <span className="text-indigo-600">5000+ Jobs</span>
          </h1>
          <img
            src="https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/assets/public/landing/group.svg"
            alt="decorative group"
            className="mb-6 mx-auto lg:mx-0"
          />
          <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-8 opacity-70">
            Great platform for the job seeker that searching for new career
            heights and passionate about startups.
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-lg p-4 shadow-lg mb-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 flex items-center gap-3 px-4 border-b border-slate-200 pb-4">
                <Search className="w-6 h-6 text-slate-900" />
                <input
                  type="text"
                  placeholder="Job title or keyword"
                  className="flex-1 outline-none text-slate-900 placeholder-slate-400"
                />
              </div>
              <div className="flex-1 flex items-center gap-3 px-4 border-b border-slate-200 pb-4">
                <MapPin className="w-6 h-6 text-slate-900" />
                <div className="flex-1 flex items-center justify-between">
                  <p className="text-slate-900 text-sm">Florence, Italy</p>
                  <ChevronDown className="w-4 h-4 text-slate-900" />
                </div>
              </div>
              <Button className="bg-indigo-600 text-white w-full lg:w-auto px-6 py-3 font-bold hover:bg-indigo-700">
                Search my job
              </Button>
            </div>
          </div>
          <p className="text-slate-600 text-sm opacity-70">
            Popular : UI Designer, UX Researcher, Android, Admin
          </p>
        </div>
      </div>
    </section>
  );
}
