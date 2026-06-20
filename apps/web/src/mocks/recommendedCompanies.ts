import type { RecommendedCompany } from '@/types/recommendedCompany';

export const RECOMMENDED_COMPANIES_MOCK: RecommendedCompany[] = [
  {
    id: 'nomad',
    name: 'Nomad',
    jobs: 3,
    description:
      'Nomad is located in Paris, France. Nomad has generates $728,000 in sales (USD).',
    logo: {
      imageUrl:
        'https://storage.googleapis.com/joblyai-public/assets/public/Nomad.svg',
      alt: 'Nomad logo',
      rounded: 'square',
    },
    tag: {
      id: 'e3b0c442-98fc-4c14-a0b5-000000000004',
      label: 'Business Service',
      tone: 'orange-outline',
    },
  },
  {
    id: 'discord',
    name: 'Discord',
    jobs: 3,
    description:
      "We'd love to work with someone like you. We care about creating a delightful experience.",
    logo: {
      imageUrl: 'https://logo.clearbit.com/discord.com',
      alt: 'Discord logo',
      rounded: 'full',
    },
    tag: {
      id: 'e3b0c442-98fc-4c14-a0b5-000000000004',
      label: 'Business Service',
      tone: 'orange-outline',
    },
  },
  {
    id: 'maze',
    name: 'Maze',
    jobs: 3,
    description:
      "We're a passionate bunch working from all over the world to build the future of rapid testing together.",
    logo: {
      imageUrl: 'https://logo.clearbit.com/maze.co',
      alt: 'Maze logo',
      rounded: 'full',
    },
    tag: {
      id: 'e3b0c442-98fc-4c14-a0b5-000000000004',
      label: 'Business Service',
      tone: 'orange-outline',
    },
  },
  {
    id: 'udacity',
    name: 'Udacity',
    jobs: 3,
    description:
      'Udacity is a new type of online university that teaches the actual programming skills.',
    logo: {
      imageUrl: 'https://logo.clearbit.com/udacity.com',
      alt: 'Udacity logo',
      rounded: 'full',
    },
    tag: {
      id: 'e3b0c442-98fc-4c14-a0b5-000000000004',
      label: 'Business Service',
      tone: 'orange-outline',
    },
  },
  {
    id: 'webflow',
    name: 'Webflow',
    jobs: 3,
    description:
      'Webflow is the first design and hosting platform built from the ground up for the mobile age.',
    logo: {
      imageUrl: 'https://logo.clearbit.com/webflow.com',
      alt: 'Webflow logo',
      rounded: 'square',
    },
    tag: {
      id: 'e3b0c442-98fc-4c14-a0b5-000000000003',
      label: 'Hosting',
      tone: 'orange-soft',
    },
  },
  {
    id: 'foundation',
    name: 'Foundation',
    jobs: 3,
    description:
      'Foundation helps creators mint and auction their digital artworks as NFTs on the Ethereum blockchain.',
    logo: {
      imageUrl: 'https://logo.clearbit.com/foundation.app',
      alt: 'Foundation logo',
      rounded: 'square',
    },
    tag: {
      id: 'e3b0c442-98fc-4c14-a0b5-000000000002',
      label: 'Fintech',
      tone: 'indigo-soft',
    },
  },
];
