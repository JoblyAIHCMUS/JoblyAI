import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return landing page data
    const landingPageData = {
      success: true,
      message: 'Landing page data',
      data: {
        hero: {
          title: 'Discover more than 5000+ Jobs',
          subtitle: 'Great platform for the job seeker that searching for new career heights and passionate about startups.',
          searchPlaceholder: 'Job title or keyword',
          locationPlaceholder: 'Florence, Italy',
        },
        companies: ['Vodafone', 'Intel', 'Tesla', 'AMD', 'TalkIt'],
        categories: [
          { name: 'Design', jobs: 235 },
          { name: 'Sales', jobs: 756 },
          { name: 'Marketing', jobs: 140 },
          { name: 'Finance', jobs: 325 },
          { name: 'Technology', jobs: 436 },
          { name: 'Engineering', jobs: 542 },
          { name: 'Business', jobs: 211 },
          { name: 'Human Resource', jobs: 346 },
        ],
        featuredJobsCount: 8,
        latestJobsCount: 8,
      },
    };

    return NextResponse.json(landingPageData, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch landing page data',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}