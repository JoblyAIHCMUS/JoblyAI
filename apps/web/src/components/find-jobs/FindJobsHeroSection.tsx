import { ChevronDown, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function FindJobsHeroSection() {
  return (
    <section className="relative overflow-hidden bg-indigo-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#F8F8FD]" />

        <div className="absolute left-0 top-20 hidden h-[436px] w-[244px] overflow-hidden lg:block">
          <Image
            src="https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/assets/public/landing/Pattern.svg"
            alt="Pattern left"
            width={834}
            height={436}
            className="absolute bottom-0 right-0 top-5 h-auto w-[834px] max-w-none opacity-90"
          />
        </div>

        <div className="absolute right-0 top-20 hidden h-[436px] w-[244px] overflow-hidden lg:block">
          <Image
            src="https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/assets/public/landing/Pattern.svg"
            alt="Pattern right"
            width={834}
            height={436}
            className="absolute left-2/3 top-5 h-auto w-[834px] max-w-none -translate-x-1/2 opacity-90"
          />
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-[1240px] flex-col items-center gap-10 px-4 pb-12 pt-28 sm:px-6 lg:px-8 lg:pb-16 lg:pt-36">
        <div className="flex w-full max-w-[1192px] flex-col gap-4">
          <div className="rounded-[5px] bg-white p-4 shadow-[0px_2.713px_4.397px_rgba(192,192,192,0.03),0px_6.863px_11.119px_rgba(192,192,192,0.04),0px_13.999px_22.683px_rgba(192,192,192,0.05),0px_28.836px_46.722px_rgba(192,192,192,0.06),0px_79px_128px_rgba(192,192,192,0.09)] sm:p-6">
            <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center lg:gap-5">
              <div className="flex flex-1 items-center gap-4 px-2 sm:px-4">
                <Search className="h-6 w-6 text-slate-900" />
                <div className="flex flex-1 flex-col gap-2 pt-2.5">
                  <input
                    type="text"
                    placeholder="Job title or keyword"
                    className="w-full border-none bg-transparent p-0 text-base leading-6 text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  <div className="h-px w-full bg-slate-300" />
                </div>
              </div>

              <div className="hidden h-14 w-px bg-slate-300 lg:block" />

              <div className="flex flex-1 items-center gap-4 px-2 sm:px-4">
                <MapPin className="h-6 w-6 text-slate-900" />
                <div className="flex flex-1 flex-col gap-2 pt-2.5">
                  <button className="flex w-full items-center justify-between text-left text-base leading-6 text-slate-900">
                    <span>Florence, Italy</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <div className="h-px w-full bg-slate-300" />
                </div>
              </div>

              <Button className="h-12 rounded-[5px] bg-indigo-600 px-6 text-base font-semibold leading-[22px] text-white hover:bg-indigo-700">
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
