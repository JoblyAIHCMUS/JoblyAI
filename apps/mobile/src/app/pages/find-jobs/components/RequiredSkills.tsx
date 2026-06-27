import React from 'react';
import { View, Text } from 'react-native';
import type {
  JobRequirement,
  RequirementImportance,
} from '@/types/job';

interface RequiredSkillsProps {
  requirements: JobRequirement[];
}

const importanceConfig: Record<
  RequirementImportance,
  { label: string; bgColor: string; textColor: string }
> = {
  REQUIRED: { label: 'Required', bgColor: '#FEE2E2', textColor: '#DC2626' },
  PREFERRED: { label: 'Preferred', bgColor: '#FEF3C7', textColor: '#D97706' },
  OPTIONAL: { label: 'Optional', bgColor: '#DBEAFE', textColor: '#2563EB' },
};

const RequiredSkills: React.FC<RequiredSkillsProps> = ({ requirements }) => {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-lg font-bold text-app-dark-text">
        Required Skills
      </Text>
      {requirements.map((req, index) => {
        const config =
          importanceConfig[req.importance] || importanceConfig.OPTIONAL;
        return (
          <View
            key={index}
            className="mb-2 flex-row items-center justify-between rounded-lg bg-app-bg-input p-3"
          >
            <Text className="text-sm font-medium text-app-dark-text">
              {req.skillName}
            </Text>
            <View className="flex-row items-center gap-2">
              {req.minYearsExperience != null && (
                <Text className="text-xs text-app-gray-3">
                  {req.minYearsExperience}+ year(s)
                </Text>
              )}
              <View
                className="rounded-full px-2 py-1"
                style={{ backgroundColor: config.bgColor }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: config.textColor }}
                >
                  {config.label}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default RequiredSkills;
