import React from 'react';
import { Text, View } from 'react-native';

import type {
  CandidateEducation,
  CandidateExperience,
  CandidateProfileResponse,
  CandidateSkill,
} from '../../../../../../types/candidate';

function formatDateRange(
  startDate: string | undefined,
  endDate: string | undefined
): string {
  if (!startDate) return 'No date provided';
  const format = (d: string) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric',
    }).format(new Date(d));
  const start = format(startDate);
  const end = endDate ? format(endDate) : 'Present';
  return `${start} - ${end}`;
}

interface SectionCardProps {
  title: string;
  emptyText: string;
  children: React.ReactNode;
}

function SectionCard({ title, emptyText, children }: SectionCardProps) {
  return (
    <View className="rounded-2xl border border-app-border-2 bg-app-background-2 p-4 mb-4">
      <Text className="text-base font-semibold text-app-slate-1 mb-2">
        {title}
      </Text>
      {children}
    </View>
  );
}

function AboutMeSection({
  about,
}: {
  about: CandidateProfileResponse['about'];
}) {
  if (!about || (!about.title && !about.bio)) {
    return (
      <SectionCard title="About Me" emptyText="No about information provided">
        <Text className="text-sm text-app-text-3">
          No about information provided
        </Text>
      </SectionCard>
    );
  }
  return (
    <SectionCard title="About Me" emptyText="No about information provided">
      {about.title && (
        <Text className="text-sm font-medium text-app-slate-1 mb-1">
          {about.title}
        </Text>
      )}
      {about.bio && (
        <Text className="text-sm text-app-slate-1">{about.bio}</Text>
      )}
    </SectionCard>
  );
}

function ExperienceItem({ exp }: { exp: CandidateExperience }) {
  return (
    <View className="py-3 border-b border-app-border-3 last:border-b-0">
      <Text className="text-base font-semibold text-app-slate-1">
        {exp.jobTitle}
      </Text>
      <View className="flex-row flex-wrap items-center mt-1">
        <Text className="text-sm text-app-text-3 font-medium">
          {exp.companyName}
        </Text>
        <Text className="mx-1.5 text-app-text-3">•</Text>
        <Text className="text-sm text-app-text-3">
          {exp.type || 'Position'}
        </Text>
        <Text className="mx-1.5 text-app-text-3">•</Text>
        <Text className="text-sm text-app-text-3">
          {formatDateRange(exp.startDate, exp.endDate)}
        </Text>
      </View>
      {exp.location && (
        <Text className="text-sm text-app-text-3 mt-1">{exp.location}</Text>
      )}
      {exp.description && (
        <Text className="text-sm text-app-slate-1 mt-2">{exp.description}</Text>
      )}
    </View>
  );
}

function ExperiencesSection({
  experiences,
}: {
  experiences?: CandidateExperience[];
}) {
  const list = experiences ?? [];
  if (list.length === 0) {
    return (
      <SectionCard
        title="Experiences"
        emptyText="No experience information provided"
      >
        <Text className="text-sm text-app-text-3">
          No experience information provided
        </Text>
      </SectionCard>
    );
  }
  return (
    <SectionCard
      title="Experiences"
      emptyText="No experience information provided"
    >
      {list.slice(0, 3).map((exp) => (
        <ExperienceItem key={exp.id} exp={exp} />
      ))}
    </SectionCard>
  );
}

function EducationItem({ edu }: { edu: CandidateEducation }) {
  return (
    <View className="py-3 border-b border-app-border-3 last:border-b-0">
      <Text className="text-base font-semibold text-app-slate-1">
        {edu.school}
      </Text>
      {edu.degree && (
        <Text className="text-sm text-app-text-3 mt-1">{edu.degree}</Text>
      )}
      <Text className="text-sm text-app-text-3 mt-1">
        {formatDateRange(edu.startDate, edu.endDate)}
      </Text>
      {edu.fieldOfStudy && (
        <Text className="text-sm text-app-text-3 mt-1">{edu.fieldOfStudy}</Text>
      )}
      {edu.description && (
        <Text className="text-sm text-app-slate-1 mt-2">{edu.description}</Text>
      )}
    </View>
  );
}

function EducationsSection({
  educations,
}: {
  educations?: CandidateEducation[];
}) {
  const list = educations ?? [];
  if (list.length === 0) {
    return (
      <SectionCard
        title="Educations"
        emptyText="No education information provided"
      >
        <Text className="text-sm text-app-text-3">
          No education information provided
        </Text>
      </SectionCard>
    );
  }
  return (
    <SectionCard
      title="Educations"
      emptyText="No education information provided"
    >
      {list.slice(0, 2).map((edu) => (
        <EducationItem key={edu.id} edu={edu} />
      ))}
    </SectionCard>
  );
}

function SkillsSection({ skills }: { skills?: CandidateSkill[] }) {
  const list = skills ?? [];
  if (list.length === 0) {
    return (
      <SectionCard title="Skills" emptyText="No skills provided">
        <Text className="text-sm text-app-text-3">No skills provided</Text>
      </SectionCard>
    );
  }
  return (
    <SectionCard title="Skills" emptyText="No skills provided">
      <View className="flex-row flex-wrap gap-2">
        {list.map((skill) => (
          <View
            key={skill.id}
            className="rounded-md px-2.5 py-1 bg-app-indigo-soft"
          >
            <Text className="text-sm font-semibold text-app-indigo-strong">
              {skill.title}
            </Text>
          </View>
        ))}
      </View>
    </SectionCard>
  );
}

function PortfoliosSection({
  portfolios,
}: {
  portfolios?: CandidateProfileResponse['portfolios'];
}) {
  const list = portfolios ?? [];
  if (list.length === 0) {
    return (
      <SectionCard title="Portfolios" emptyText="No portfolios provided">
        <Text className="text-sm text-app-text-3">No portfolios provided</Text>
      </SectionCard>
    );
  }
  return (
    <SectionCard title="Portfolios" emptyText="No portfolios provided">
      <View className="flex-row flex-wrap gap-2">
        {list.map((p, idx) => (
          <View key={idx} className="flex-1 min-w-[45%]">
            <Text
              className="text-sm font-medium text-app-slate-1"
              numberOfLines={2}
            >
              {p.name}
            </Text>
          </View>
        ))}
      </View>
    </SectionCard>
  );
}

interface ApplicantProfilePanelProps {
  profile?: CandidateProfileResponse;
  loading: boolean;
  error: unknown;
}

export function ApplicantProfilePanel({
  profile,
  loading,
  error,
}: ApplicantProfilePanelProps) {
  if (loading) {
    return (
      <View className="py-8 items-center">
        <Text className="text-sm text-app-text-3">Loading profile…</Text>
      </View>
    );
  }

  if (error && !profile) {
    return (
      <View className="py-8 items-center">
        <Text className="text-sm text-app-text-3">
          Unable to load profile. Showing basic information.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <AboutMeSection about={profile?.about} />
      <ExperiencesSection experiences={profile?.experiences} />
      <EducationsSection educations={profile?.educations} />
      <SkillsSection skills={profile?.skills} />
      <PortfoliosSection portfolios={profile?.portfolios} />
    </View>
  );
}
