import { ArrowRight } from 'lucide-react';

interface FeaturedJob {
  title: string;
  company: string;
  location: string;
  tags: string[];
}

const featuredJobs: FeaturedJob[] = [
  { title: 'Email Marketing', company: 'Revolut', location: 'Madrid, Spain', tags: ['Marketing', 'Design'] },
  { title: 'Brand Designer', company: 'Dropbox', location: 'San Fransisco, US', tags: ['Design', 'Business'] },
  { title: 'Email Marketing', company: 'Pitch', location: 'Berlin, Germany', tags: ['Marketing'] },
  { title: 'Visual Designer', company: 'Blinklist', location: 'Granada, Spain', tags: ['Design'] },
  { title: 'Product Designer', company: 'ClassPass', location: 'Manchester, UK', tags: ['Marketing', 'Design'] },
  { title: 'Lead Designer', company: 'Canva', location: 'Ontario, Canada', tags: ['Design', 'Business'] },
  { title: 'Brand Strategist', company: 'GoDaddy', location: 'Marseille, France', tags: ['Marketing'] },
  { title: 'Data Analyst', company: 'Twitter', location: 'San Diego, US', tags: ['Technology'] },
];

export default function FeaturedJobsSection() {
  return (
    <section className="py-16 px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-5xl font-bold">
            Featured <span className="text-indigo-600">jobs</span>
          </h2>
          <button className="text-indigo-600 font-semibold flex items-center gap-2 hover:text-indigo-700">
            Show all jobs <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-8">
          {featuredJobs.map((job, idx) => (
            <div key={idx} className="p-6 border border-slate-200 rounded-lg bg-white hover:shadow-lg transition">
              <div className="w-12 h-12 bg-slate-300 rounded-full mb-4"></div>
              <div className="inline-block px-3 py-1 border border-indigo-600 text-indigo-600 text-xs font-semibold rounded mb-4">
                Full Time
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{job.title}</h3>
              <p className="text-sm text-slate-600 mb-4">
                {job.company} • {job.location}
              </p>
              <p className="text-sm text-slate-500 mb-4">Lorem ipsum dolor sit amet...</p>
              <div className="flex gap-2 flex-wrap">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-teal-100 text-teal-600 text-xs font-semibold rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}