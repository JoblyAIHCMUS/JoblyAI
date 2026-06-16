import type { ReactNode } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import RenderHtml from 'react-native-render-html';
import {
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  Globe2,
  Users,
} from 'lucide-react-native';

import type { Company } from '../../../../types/company';
import {
  INDUSTRY_LABELS,
  SCALE_LABELS,
} from '../../employer/company-profile/constants';

export interface CompanyOverviewSectionProps {
  company: Company;
  contentWidth: number;
  openJobsCount: number;
  onWebsitePress: () => void;
}

interface InfoRowData {
  icon: ReactNode;
  label: string;
  value: string;
}

const htmlTagStyles: Record<string, Record<string, unknown>> = {
  body: { color: '#25324b', fontSize: 15, lineHeight: 22 },
  h2: {
    color: '#25324b',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 18,
  },
  h3: {
    color: '#25324b',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 14,
  },
  p: { marginBottom: 8, marginTop: 6 },
  ul: { paddingLeft: 8 },
  ol: { paddingLeft: 8 },
  li: { marginBottom: 4 },
  strong: { fontWeight: '700' },
};

function getInitials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? '')
    .join('');
}

function stripHtml(value: string | null): string {
  return (
    value
      ?.replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() ?? ''
  );
}

export function CompanyOverviewSection({
  company,
  contentWidth,
  openJobsCount,
  onWebsitePress,
}: CompanyOverviewSectionProps) {
  const companyInitials = getInitials(company.name) || 'C';
  const infoRows: InfoRowData[] = [];

  if (company.industry) {
    infoRows.push({
      icon: <Building2 size={19} color="#4640de" />,
      label: 'Industry',
      value: INDUSTRY_LABELS[company.industry] || company.industry,
    });
  }

  if (company.sizeRange) {
    infoRows.push({
      icon: <Users size={19} color="#4640de" />,
      label: 'Company size',
      value: SCALE_LABELS[company.sizeRange] || company.sizeRange,
    });
  }

  infoRows.push({
    icon: <BriefcaseBusiness size={19} color="#4640de" />,
    label: 'Open jobs',
    value: `${openJobsCount} active ${openJobsCount === 1 ? 'role' : 'roles'}`,
  });

  return (
    <>
      <View className="rounded-lg border border-app-border-1 bg-app-white-1 p-5">
        {company.logoUrl ? (
          <Image
            source={{ uri: company.logoUrl }}
            className="h-24 w-24 rounded-xl border border-app-border-1 bg-app-white-1"
            resizeMode="contain"
          />
        ) : (
          <View className="h-24 w-24 items-center justify-center rounded-xl bg-[#eef0ff]">
            <Text className="text-2xl font-bold text-[#4640de]">
              {companyInitials}
            </Text>
          </View>
        )}

        <Text className="mt-5 text-3xl font-bold leading-9 text-app-text-4">
          {company.name}
        </Text>

        <Text className="mt-3 text-base leading-6 text-[#64748b]">
          {stripHtml(company.description) ||
            'Explore this company profile and current openings.'}
        </Text>

        {company.websiteUrl ? (
          <TouchableOpacity
            activeOpacity={0.75}
            className="mt-5 flex-row items-center gap-2 self-start rounded-lg border border-[#4640de] px-4 py-2.5"
            onPress={onWebsitePress}
          >
            <Globe2 size={16} color="#4640de" />
            <Text className="text-sm font-bold text-[#4640de]">Website</Text>
            <ExternalLink size={14} color="#4640de" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View className="mt-4 gap-3">
        {infoRows.map(({ icon, label, value }) => (
          <View
            key={label}
            className="flex-row items-center gap-3 rounded-lg border border-app-border-1 bg-app-white-1 px-4 py-3"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#eef0ff]">
              {icon}
            </View>
            <View className="flex-1">
              <Text className="text-xs font-medium uppercase text-app-text-2">
                {label}
              </Text>
              <Text className="mt-1 text-base font-semibold text-app-text-4">
                {value}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View className="mt-6">
        <Text className="text-2xl font-bold text-app-text-4">
          About {company.name}
        </Text>

        <View className="mt-3 rounded-lg border border-app-border-1 bg-app-white-1 px-4 py-3">
          {company.description ? (
            <RenderHtml
              contentWidth={contentWidth}
              source={{ html: company.description }}
              tagsStyles={htmlTagStyles}
            />
          ) : (
            <Text className="text-sm leading-5 text-app-text-2">
              This company has not added an about section yet.
            </Text>
          )}
        </View>
      </View>
    </>
  );
}
