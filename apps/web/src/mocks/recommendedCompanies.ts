import type { RecommendedCompany } from '@/types/recommendedCompany';

export const RECOMMENDED_COMPANIES_MOCK: RecommendedCompany[] = [
  {
    name: 'Nomad',
    jobs: '3 Jobs',
    description:
      'Nomad is located in Paris, France. Nomad has generates $728,000 in sales (USD).',
    logo: {
      imageUrl: '/Nomad.svg',
      alt: 'Nomad logo',
      rounded: 'square',
    },
    tags: [{ label: 'Business Service', tone: 'orange-outline' }],
  },
  {
    name: 'Discord',
    jobs: '3 Jobs',
    description:
      "We'd love to work with someone like you. We care about creating a delightful experience.",
    logo: {
      imageUrl: 'https://logo.clearbit.com/discord.com',
      alt: 'Discord logo',
      rounded: 'full',
    },
    tags: [{ label: 'Business Service', tone: 'orange-outline' }],
  },
  {
    name: 'Maze',
    jobs: '3 Jobs',
    description:
      "We're a passionate bunch working from all over the world to build the future of rapid testing together.",
    logo: {
      imageUrl: 'https://logo.clearbit.com/maze.co',
      alt: 'Maze logo',
      rounded: 'full',
    },
    tags: [{ label: 'Business Service', tone: 'orange-outline' }],
  },
  {
    name: 'Udacity',
    jobs: '3 Jobs',
    description:
      'Udacity is a new type of online university that teaches the actual programming skills.',
    logo: {
      imageUrl: 'https://logo.clearbit.com/udacity.com',
      alt: 'Udacity logo',
      rounded: 'full',
    },
    tags: [{ label: 'Business Service', tone: 'orange-outline' }],
  },
  {
    name: 'Webflow',
    jobs: '3 Jobs',
    description:
      'Webflow is the first design and hosting platform built from the ground up for the mobile age.',
    logo: {
      imageUrl: 'https://logo.clearbit.com/webflow.com',
      alt: 'Webflow logo',
      rounded: 'square',
    },
    tags: [
      { label: 'Business Service', tone: 'orange-outline' },
      { label: 'Technology', tone: 'orange-soft' },
    ],
  },
  {
    name: 'Foundation',
    jobs: '3 Jobs',
    description:
      'Foundation helps creators mint and auction their digital artworks as NFTs on the Ethereum blockchain.',
    logo: {
      imageUrl: 'https://logo.clearbit.com/foundation.app',
      alt: 'Foundation logo',
      rounded: 'square',
    },
    tags: [
      { label: 'Business Service', tone: 'orange-outline' },
      { label: 'Crypto', tone: 'indigo-soft' },
    ],
  },
];
