import {
  type JobListingStatus,
  type EmploymentType,
} from '@/features/employer/job-listing/data';
import { type SkillEntry } from '@/components/employer/skillTagsManager';

export type Category =
  | 'design'
  | 'marketing'
  | 'business'
  | 'technology'
  | 'sales'
  | 'finance'
  | 'human-resources'
  | 'operations'
  | 'other';

export type SalaryCurrency =
  | 'none'
  | 'usd'
  | 'eur'
  | 'gbp'
  | 'vnd'
  | 'jpy'
  | 'cny';

export type HiringStage =
  | 'In Review'
  | 'Shortlisted'
  | 'Interviewed'
  | 'Hired'
  | 'Declined';

export interface Applicant {
  id: string;
  name: string;
  image: string;
  appliedDate: string;
  score: number;
  hiringStage: HiringStage;
}

export interface JobListingDetail {
  id: string;
  title: string;
  status: JobListingStatus;
  employmentType: EmploymentType;
  remote: boolean;
  location?: string;
  category: Category;
  salaryCurrency: SalaryCurrency;
  salaryMin: string;
  salaryMax: string;
  skills: SkillEntry[];
  datePosted: string;
  dateClosed: string | null;
  description: string;
  applicants: Applicant[];
}

export const jobListingDetails: Record<string, JobListingDetail> = {
  '1': {
    id: '1',
    title: 'Social Media Assistant',
    status: 'Live',
    employmentType: 'FULL_TIME',
    remote: false,
    location: '123 This St, That City, The Other Country',
    category: 'marketing',
    salaryCurrency: 'usd',
    salaryMin: '35000',
    salaryMax: '50000',
    skills: [
      { name: 'Social Media', importance: 'REQUIRED' },
      {
        name: 'Content Creation',
        importance: 'REQUIRED',
        minYearsExperience: 1,
      },
      { name: 'Copywriting', importance: 'PREFERRED' },
      { name: 'Analytics', importance: 'OPTIONAL' },
    ],
    datePosted: '2020-05-20',
    dateClosed: null,
    description:
      '<h2>About the Role</h2><p>We are looking for a <strong>Social Media Assistant</strong> to help manage our online presence across <em>multiple platforms</em>. This is a unique opportunity to join a fast-growing team and make a <strong>real impact</strong> on our brand visibility.</p><p>You will work closely with our <strong>Marketing Director</strong> and collaborate with content creators, graphic designers, and data analysts to deliver <em>cohesive campaigns</em> that resonate with our audience.</p><hr><h3>Key Responsibilities</h3><ul><li>Create and schedule <strong>engaging social media content</strong> across Instagram, Twitter, LinkedIn, and TikTok</li><li>Monitor analytics and report on campaign performance using tools like <code>Google Analytics</code> and <code>Hootsuite</code></li><li>Respond to comments and messages in a <em>timely and professional manner</em></li><li>Collaborate with the marketing team on brand strategies and <strong>quarterly campaign planning</strong></li><li>Research trending topics and <s>outdated strategies</s> emerging opportunities in social media</li><li>Maintain a consistent <em>brand voice</em> and visual identity across all channels</li></ul><h3>Daily Workflow</h3><ol><li>Review overnight engagement metrics and flag any urgent items</li><li>Draft and schedule the day&apos;s content using our publishing calendar</li><li>Engage with followers and respond to DMs within <strong>2 hours</strong></li><li>Attend the weekly marketing sync meeting every <em>Tuesday at 10 AM</em></li><li>Submit a weekly performance report by <strong>Friday EOD</strong></li></ol><hr><h3>Requirements</h3><ul><li><strong>1+ years</strong> of experience managing social media accounts</li><li>Excellent written communication skills with a knack for <em>storytelling</em></li><li>Familiarity with social media management tools such as <code>Buffer</code>, <code>Sprout Social</code>, or <code>Later</code></li><li>Basic understanding of <strong>SEO principles</strong> and content optimization</li><li>Experience with <em>photo and video editing</em> is a plus</li></ul><h3>Nice to Have</h3><ul><li>Knowledge of <code>Canva</code> or <code>Adobe Creative Suite</code></li><li>Experience running <strong>paid social campaigns</strong> (Facebook Ads, Instagram Ads)</li><li>Familiarity with <em>influencer outreach</em> and partnership management</li></ul><blockquote><p>We believe in a <strong>creative and inclusive</strong> work environment. Our team values <em>diversity of thought</em> and encourages everyone to bring their authentic selves to work every day.</p></blockquote><h3>Compensation &amp; Benefits</h3><p>This is a <strong>full-time remote position</strong> with competitive pay. Benefits include:</p><ul><li>Flexible working hours and <em>unlimited PTO</em></li><li>Monthly wellness stipend of <strong>$100</strong></li><li>Annual learning and development budget</li><li>Company-provided equipment (MacBook Pro, monitor, etc.)</li></ul><h3>How to Apply</h3><p>Submit your resume along with links to <strong>social media accounts</strong> you have managed. Please include a brief cover letter explaining why you are excited about this role. <s>No phone calls please.</s> We review applications on a <em>rolling basis</em> and will reach out to qualified candidates within <strong>5 business days</strong>.</p>',
    applicants: [
      {
        id: '1',
        name: 'Alice Johnson',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
        appliedDate: '2020-05-21',
        score: 8.2,
        hiringStage: 'Hired',
      },
      {
        id: '2',
        name: 'Bob Smith',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
        appliedDate: '2020-05-22',
        score: 6.7,
        hiringStage: 'Declined',
      },
      {
        id: '3',
        name: 'Carol Lee',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
        appliedDate: '2020-05-23',
        score: 8.5,
        hiringStage: 'Interviewed',
      },
      {
        id: '4',
        name: 'Ethan Park',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan',
        appliedDate: '2020-05-23',
        score: 6.9,
        hiringStage: 'Shortlisted',
      },
      {
        id: '5',
        name: 'Fatima Al-Hassan',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
        appliedDate: '2020-05-24',
        score: 8.1,
        hiringStage: 'In Review',
      },
      {
        id: '6',
        name: 'George Chen',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=George',
        appliedDate: '2020-05-24',
        score: 6.4,
        hiringStage: 'Declined',
      },
      {
        id: '7',
        name: 'Hannah Müller',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hannah',
        appliedDate: '2020-05-25',
        score: 8.7,
        hiringStage: 'Hired',
      },
      {
        id: '8',
        name: 'Ivan Petrov',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan',
        appliedDate: '2020-05-25',
        score: 6.2,
        hiringStage: 'Declined',
      },
      {
        id: '9',
        name: 'Jessica Okafor',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
        appliedDate: '2020-05-26',
        score: 8.0,
        hiringStage: 'Interviewed',
      },
      {
        id: '10',
        name: 'Kevin Tanaka',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin',
        appliedDate: '2020-05-26',
        score: 3.8,
        hiringStage: 'Shortlisted',
      },
      {
        id: '11',
        name: 'Laura Martínez',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
        appliedDate: '2020-05-27',
        score: 4.3,
        hiringStage: 'Interviewed',
      },
      {
        id: '12',
        name: 'Marcus Williams',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
        appliedDate: '2020-05-27',
        score: 3.5,
        hiringStage: 'In Review',
      },
      {
        id: '13',
        name: 'Nina Johansson',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina',
        appliedDate: '2020-05-28',
        score: 8.6,
        hiringStage: 'Shortlisted',
      },
      {
        id: '14',
        name: 'Omar Farouk',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Omar',
        appliedDate: '2020-05-28',
        score: 6.1,
        hiringStage: 'Declined',
      },
      {
        id: '15',
        name: 'Priya Sharma',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        appliedDate: '2020-05-29',
        score: 7.4,
        hiringStage: 'In Review',
      },
    ],
  },
  '2': {
    id: '2',
    title: 'Senior Designer',
    status: 'Live',
    employmentType: 'FULL_TIME',
    remote: true,
    category: 'design',
    salaryCurrency: 'usd',
    salaryMin: '80000',
    salaryMax: '120000',
    skills: [
      { name: 'Figma', importance: 'REQUIRED', minYearsExperience: 3 },
      { name: 'UI/UX', importance: 'REQUIRED', minYearsExperience: 5 },
      { name: 'Typography', importance: 'PREFERRED' },
      {
        name: 'Design Systems',
        importance: 'PREFERRED',
        minYearsExperience: 2,
      },
      { name: 'Prototyping', importance: 'OPTIONAL' },
    ],
    datePosted: '2020-05-16',
    dateClosed: null,
    description:
      '<h2>About the Role</h2><p>Join our design team as a <strong>Senior Designer</strong> to lead visual projects and mentor junior designers. You will be responsible for shaping the <em>visual direction</em> of our product and ensuring a <strong>world-class user experience</strong> across web and mobile platforms.</p><p>Our design team is at the heart of everything we build. We are looking for someone who is <em>passionate about craft</em>, thrives in a collaborative environment, and can balance <strong>aesthetics with functionality</strong>.</p><hr><h3>Key Responsibilities</h3><ul><li>Lead <strong>end-to-end design</strong> for major product features from concept to launch</li><li>Establish and maintain <em>design systems</em> and comprehensive style guidelines</li><li>Conduct user research, <strong>usability testing</strong>, and A/B experiments</li><li>Mentor and provide <em>constructive feedback</em> to junior team members</li><li>Partner with engineering to ensure <strong>pixel-perfect implementation</strong></li><li>Present design work to stakeholders and <s>defend decisions</s> advocate for user-centered solutions</li></ul><h3>Design Process</h3><ol><li>Gather requirements and understand user needs through <strong>stakeholder interviews</strong></li><li>Create wireframes and low-fidelity prototypes for initial feedback</li><li>Develop <em>high-fidelity mockups</em> in Figma with interactive components</li><li>Conduct usability testing sessions with <strong>5-8 participants</strong> per round</li><li>Iterate based on feedback and hand off specs to engineering using <code>Zeplin</code></li><li>Perform <em>design QA</em> during development and post-launch review</li></ol><hr><h3>Qualifications</h3><ul><li><strong>5+ years</strong> of professional design experience in a product-focused role</li><li>Strong portfolio demonstrating <em>UI/UX expertise</em> across web and mobile</li><li>Proficiency in <code>Figma</code>, <code>Sketch</code>, and prototyping tools like <code>Principle</code> or <code>Framer</code></li><li>Deep understanding of <strong>typography</strong>, color theory, and layout principles</li><li>Experience building and maintaining <em>component-based design systems</em></li></ul><h3>Nice to Have</h3><ul><li>Familiarity with front-end technologies (<code>HTML</code>, <code>CSS</code>, <code>React</code>)</li><li>Experience with <strong>motion design</strong> and animation tools like <code>After Effects</code></li><li>Background in <em>accessibility standards</em> (WCAG 2.1 AA compliance)</li><li>Previous experience in a <strong>B2B SaaS</strong> or enterprise product environment</li></ul><blockquote><p>We offer a <strong>creative and collaborative</strong> work environment with flexible hours. Our team believes that <em>great design is born from diverse perspectives</em>, and we actively foster an inclusive culture where every voice is valued.</p></blockquote><h3>Compensation &amp; Perks</h3><p>This is a <strong>full-time, on-site position</strong> based in our San Francisco office. Our comprehensive benefits package includes:</p><ul><li>Competitive salary range of <strong>$80,000 - $120,000</strong> based on experience</li><li>Equity options and <em>annual performance bonuses</em></li><li>$2,000 annual stipend for <strong>design tools and conferences</strong></li><li>Catered lunches, snacks, and a fully stocked <em>coffee bar</em></li><li>Generous parental leave and <strong>comprehensive health insurance</strong></li></ul><h3>Interview Process</h3><ol><li>Initial <strong>portfolio review</strong> by the design team lead</li><li>30-minute phone screen with our <em>People Operations</em> team</li><li>Design challenge: a take-home exercise (estimated <strong>3-4 hours</strong>)</li><li>On-site presentation and <em>cross-functional panel interview</em></li><li>Final conversation with the <strong>VP of Product</strong></li></ol><p>We aim to complete the process within <strong>2-3 weeks</strong>. We value your time and provide <em>detailed feedback</em> to all candidates who reach the design challenge stage.</p>',
    applicants: [
      {
        id: '3',
        name: 'Carol Lee',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
        appliedDate: '2020-05-17',
        score: 7.8,
        hiringStage: 'Shortlisted',
      },
    ],
  },
};
