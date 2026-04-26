// Shared constants for the Business Model Canvas Builder feature.

import { SOCKET_URL as BASE_ORIGIN } from '@/config';

export const API_BASE = BASE_ORIGIN;
export const SOCKET_URL = BASE_ORIGIN;

export const SECTION_KEYS = [
  'keyPartnerships',
  'keyActivities',
  'keyResources',
  'valuePropositions',
  'customerRelationships',
  'channels',
  'customerSegments',
  'costStructure',
  'revenueStreams'
];

// Strategyzer-inspired palette for the 9 sections.
export const SECTION_META = {
  keyPartnerships: {
    label: 'Key Partnerships',
    bg: 'bg-orange-100',
    ring: 'ring-orange-300',
    border: 'border-orange-300',
    accent: 'text-orange-900'
  },
  keyActivities: {
    label: 'Key Activities',
    bg: 'bg-blue-100',
    ring: 'ring-blue-300',
    border: 'border-blue-300',
    accent: 'text-blue-900'
  },
  keyResources: {
    label: 'Key Resources',
    bg: 'bg-blue-100',
    ring: 'ring-blue-300',
    border: 'border-blue-300',
    accent: 'text-blue-900'
  },
  valuePropositions: {
    label: 'Value Propositions',
    bg: 'bg-yellow-100',
    ring: 'ring-yellow-400',
    border: 'border-yellow-400',
    accent: 'text-yellow-900'
  },
  customerRelationships: {
    label: 'Customer Relationships',
    bg: 'bg-green-100',
    ring: 'ring-green-300',
    border: 'border-green-300',
    accent: 'text-green-900'
  },
  channels: {
    label: 'Channels',
    bg: 'bg-green-100',
    ring: 'ring-green-300',
    border: 'border-green-300',
    accent: 'text-green-900'
  },
  customerSegments: {
    label: 'Customer Segments',
    bg: 'bg-purple-100',
    ring: 'ring-purple-300',
    border: 'border-purple-300',
    accent: 'text-purple-900'
  },
  costStructure: {
    label: 'Cost Structure',
    bg: 'bg-red-100',
    ring: 'ring-red-300',
    border: 'border-red-300',
    accent: 'text-red-900'
  },
  revenueStreams: {
    label: 'Revenue Streams',
    bg: 'bg-red-100',
    ring: 'ring-red-300',
    border: 'border-red-300',
    accent: 'text-red-900'
  }
};

// Tailwind grid positioning for each section — faithfully replicating
// Strategyzer's Business Model Canvas proportions on a 5×3 grid.
// md: prefixes are baked in so Tailwind's static scanner can pick them up.
export const SECTION_GRID = {
  keyPartnerships:       'md:col-start-1 md:col-span-1 md:row-start-1 md:row-span-2',
  keyActivities:         'md:col-start-2 md:col-span-1 md:row-start-1 md:row-span-1',
  keyResources:          'md:col-start-2 md:col-span-1 md:row-start-2 md:row-span-1',
  valuePropositions:     'md:col-start-3 md:col-span-1 md:row-start-1 md:row-span-2',
  customerRelationships: 'md:col-start-4 md:col-span-1 md:row-start-1 md:row-span-1',
  channels:              'md:col-start-4 md:col-span-1 md:row-start-2 md:row-span-1',
  customerSegments:      'md:col-start-5 md:col-span-1 md:row-start-1 md:row-span-2',
  costStructure:         'md:col-start-1 md:col-span-2 md:row-start-3 md:row-span-1',
  revenueStreams:        'md:col-start-3 md:col-span-3 md:row-start-3 md:row-span-1'
};

export const SECTION_PROMPTS = {
  keyPartnerships: [
    'Who are your key partners and suppliers?',
    'Which resources do you get from partners?',
    'Which activities do partners perform?'
  ],
  keyActivities: [
    'What key activities does your value proposition require?',
    'What activities are most important for distribution?'
  ],
  keyResources: [
    'What key resources does your value proposition require?',
    'Physical, intellectual, human, or financial?'
  ],
  valuePropositions: [
    'What value do you deliver to customers?',
    'Which customer problems are you solving?',
    'What bundles of products/services are you offering?'
  ],
  customerRelationships: [
    'What relationship does each segment expect?',
    'How costly are these relationships?'
  ],
  channels: [
    'Through which channels do customers want to be reached?',
    'Which channels work best and are most cost-efficient?'
  ],
  customerSegments: [
    'For whom are you creating value?',
    'Who are your most important customers?'
  ],
  costStructure: [
    'What are the most important costs in your business?',
    'Which key resources and activities are most expensive?'
  ],
  revenueStreams: [
    'For what value are customers willing to pay?',
    'How much does each revenue stream contribute?'
  ]
};

export const CARD_COLORS = {
  yellow: { bg: 'bg-amber-100', border: 'border-amber-300', dot: 'bg-amber-400' },
  blue:   { bg: 'bg-sky-100',   border: 'border-sky-300',   dot: 'bg-sky-400' },
  green:  { bg: 'bg-emerald-100', border: 'border-emerald-300', dot: 'bg-emerald-400' },
  pink:   { bg: 'bg-pink-100',  border: 'border-pink-300',  dot: 'bg-pink-400' },
  orange: { bg: 'bg-orange-100', border: 'border-orange-300', dot: 'bg-orange-400' }
};

export const SAMPLE_TEMPLATE = {
  keyPartnerships: ['Universities & colleges', 'Local NGOs', 'Internet service providers', 'Content creators'],
  keyActivities: ['Platform development', 'Content curation', 'Marketing campaigns', 'Teacher onboarding'],
  keyResources: ['Development team', 'Learning management system', 'Course content library', 'Brand reputation'],
  valuePropositions: ['Affordable quality education', 'Learn at your own pace', 'Industry-relevant curriculum', 'Certificate on completion'],
  customerRelationships: ['Online community support', 'Live Q&A sessions', 'Email newsletters'],
  channels: ['Social media (Facebook, YouTube)', 'Word of mouth', 'University partnerships'],
  customerSegments: ['University students aged 18-25', 'Recent graduates seeking skills', 'Working professionals upskilling'],
  costStructure: ['Server & infrastructure', 'Content production', 'Marketing spend', 'Team salaries'],
  revenueStreams: ['Monthly subscriptions (BDT 299/month)', 'Course one-time purchases', 'Corporate training packages']
};
