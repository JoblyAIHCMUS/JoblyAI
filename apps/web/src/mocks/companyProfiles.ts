import type { CompanyProfile } from '@/types/companyProfile';

export const COMPANY_PROFILE_OVERRIDES: Partial<Record<string, Partial<CompanyProfile>>> = {
  stripe: {
    website: 'https://stripe.com',
    description:
      'Stripe is a software platform for starting and running internet businesses. Millions of businesses rely on Stripe\'s software tools to accept payments, expand globally, and manage their businesses online. Stripe has been at the forefront of expanding internet commerce, powering new business models, and supporting the latest platforms, from marketplaces to mobile commerce sites. We believe that growing the GDP of the internet is a problem rooted in code and design, not finance. Stripe is built for developers, makers, and creators. We work on solving the hard technical problems necessary to build global economic infrastructure, from designing highly reliable systems to developing advanced machine learning algorithms to prevent fraud.',
    officeSummary: 'Stripe offices spread across 20 countries',
    stats: [
      { label: 'Founded', value: 'July 31, 2011' },
      { label: 'Employees', value: '4000+' },
      { label: 'Location', value: '20 countries' },
      { label: 'Industry', value: 'Fintech' },
    ],
    officeLocations: [
      { emoji: '🇺🇸', label: 'United States' },
      { emoji: '🏴', label: 'England' },
      { emoji: '🇯🇵', label: 'Japan' },
      { emoji: '🇦🇺', label: 'Australia' },
      { emoji: '🇨🇳', label: 'China' },
    ],
    contacts: [
      { type: 'twitter', label: 'twitter.com/stripe', href: 'https://twitter.com/stripe' },
      { type: 'facebook', label: 'facebook.com/StripeHQ', href: 'https://facebook.com/StripeHQ' },
      {
        type: 'linkedin',
        label: 'linkedin.com/company/stripe',
        href: 'https://www.linkedin.com/company/stripe',
      },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80',
    ],
    team: [
      {
        id: 'celestin-gardinier',
        name: 'Celestin Gardinier',
        role: 'CEO & Co-Founder',
        avatarUrl: 'https://i.pravatar.cc/160?img=12',
        instagramUrl: '#',
        linkedinUrl: '#',
      },
      {
        id: 'reynaud-colbert',
        name: 'Reynaud Colbert',
        role: 'Co-Founder',
        avatarUrl: 'https://i.pravatar.cc/160?img=15',
        instagramUrl: '#',
        linkedinUrl: '#',
      },
      {
        id: 'arienne-lyon',
        name: 'Arienne Lyon',
        role: 'Managing Director',
        avatarUrl: 'https://i.pravatar.cc/160?img=32',
        instagramUrl: '#',
        linkedinUrl: '#',
      },
      {
        id: 'bernard-alexander',
        name: 'Bernard Alexander',
        role: 'Managing Director',
        avatarUrl: 'https://i.pravatar.cc/160?img=20',
        instagramUrl: '#',
        linkedinUrl: '#',
      },
      {
        id: 'christine-jonson',
        name: 'Christine Jonson',
        role: 'Managing Director',
        avatarUrl: 'https://i.pravatar.cc/160?img=47',
        instagramUrl: '#',
        linkedinUrl: '#',
      },
    ],
  },
  nomad: {
    website: 'https://nomad.io',
    officeSummary: 'Nomad works across distributed hubs in Europe and APAC',
    stats: [
      { label: 'Founded', value: 'May 14, 2018' },
      { label: 'Employees', value: '180+' },
      { label: 'Location', value: '12 countries' },
      { label: 'Industry', value: 'Business Service' },
    ],
    officeLocations: [
      { emoji: '🇫🇷', label: 'France' },
      { emoji: '🇩🇪', label: 'Germany' },
      { emoji: '🇸🇬', label: 'Singapore' },
      { emoji: '🇬🇧', label: 'United Kingdom' },
    ],
  },
};