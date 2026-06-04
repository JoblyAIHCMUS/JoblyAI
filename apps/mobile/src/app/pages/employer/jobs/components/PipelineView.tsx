import React, { useMemo } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';

import { Applicant, ApplicantStatus } from './ApplicantsTab';
import { PipelineColumn } from './PipelineColumn';

interface PipelineViewProps {
  applicants: Applicant[];
  onUpdateStage?: (applicantId: string, newStage: ApplicantStatus) => void;
  isUpdating?: boolean;
}

export function PipelineView({
  applicants,
  onUpdateStage,
  isUpdating,
}: PipelineViewProps) {
  const { width } = useWindowDimensions();

  const groupedApplicants = useMemo(() => {
    const columns = [
      {
        id: 'In Review',
        apiStatus: 'In-review',
        border: 'border-app-yellow-1',
        dot: 'bg-app-yellow-1',
      },
      {
        id: 'Interview',
        apiStatus: 'Interviewed',
        border: 'border-app-secondary-2',
        dot: 'bg-app-secondary-2',
      },
      {
        id: 'Hired',
        apiStatus: 'Hired',
        border: 'border-app-teal-1',
        dot: 'bg-app-teal-1',
      },
      {
        id: 'Rejected',
        apiStatus: 'Rejected',
        border: 'border-app-red-1',
        dot: 'bg-app-red-1',
      },
      {
        id: 'Withdrawn',
        apiStatus: 'Withdrawn',
        border: 'border-app-gray-3',
        dot: 'bg-app-gray-3',
      },
    ] as const;

    return columns.map((col) => ({
      ...col,
      items: applicants.filter(
        (applicant) => applicant.status === col.apiStatus
      ),
    }));
  }, [applicants]);

  // Column width is screen width - 32px, plus 16px total horizontal margin (mx-2)
  const snapInterval = width - 16;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 16 }}
      className="flex-1"
      snapToInterval={snapInterval}
      decelerationRate="fast"
    >
      <View className="flex-row items-start">
        {groupedApplicants.map((col) => (
          <PipelineColumn
            key={col.id}
            title={col.id}
            applicants={col.items}
            borderColor={col.border}
            dotColor={col.dot}
            onUpdateStage={onUpdateStage}
            isUpdating={isUpdating}
          />
        ))}
      </View>
    </ScrollView>
  );
}
