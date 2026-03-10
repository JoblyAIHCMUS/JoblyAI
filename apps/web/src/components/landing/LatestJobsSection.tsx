import { ArrowRight } from 'lucide-react';

interface LatestJob {
  title: string;
  company: string;
  location: string;
  type: string;
  tags: string[];
}

const latestJobs: LatestJob[] = [
  {
    title: 'Social Media Assistant',
    company: 'Nomad',
    location: 'Paris, France',
    type: 'Full-Time',
    tags: ['Marketing', 'Design'],
  },
  {
    title: 'Brand Designer',
    company: 'Dropbox',
    location: 'San Fransisco, USA',
    type: 'Full-Time',
    tags: ['Marketing', 'Design'],
  },
  {
    title: 'Interactive Developer',
    company: 'Terraform',
    location: 'Hamburg, Germany',
    type: 'Full-Time',
    tags: ['Marketing', 'Design'],
  },
  {
    title: 'HR Manager',
    company: 'Packer',
    location: 'Lucern, Switzerland',
    type: 'Full-Time',
    tags: ['Marketing', 'Design'],
  },
  {
    title: 'Social Media Assistant',
    company: 'Netlify',
    location: 'Paris, France',
    type: 'Full-Time',
    tags: ['Marketing', 'Design'],
  },
  {
    title: 'Brand Designer',
    company: 'Maze',
    location: 'San Fransisco, USA',
    type: 'Full-Time',
    tags: ['Marketing', 'Design'],
  },
  {
    title: 'Interactive Developer',
    company: 'Udacity',
    location: 'Hamburg, Germany',
    type: 'Full-Time',
    tags: ['Marketing', 'Design'],
  },
  {
    title: 'HR Manager',
    company: 'Webflow',
    location: 'Lucern, Switzerland',
    type: 'Full-Time',
    tags: ['Marketing', 'Design'],
  },
];

export default function LatestJobsSection() {
  return (
    <section className="py-16 px-4 md:px-8 lg:px-12 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Latest <span className="text-indigo-600">jobs open</span>
          </h2>
          <button className="text-indigo-600 font-semibold flex items-center gap-2 hover:text-indigo-700 whitespace-nowrap">
            Show all jobs <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          {latestJobs.map((job, idx) => (
            <div
              key={idx}
              className="p-4 md:p-6 border border-slate-200 rounded-lg bg-white hover:shadow-lg transition flex gap-3 md:gap-6"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-300 rounded-full flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-xl font-bold text-slate-900 mb-1">
                  {job.title}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 mb-3">
                  {job.company} • {job.location}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2 md:px-3 py-1 bg-teal-100 text-teal-600 text-xs font-semibold rounded-full">
                    {job.type}
                  </span>
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 md:px-3 py-1 border border-orange-500 text-orange-500 text-xs font-semibold rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
