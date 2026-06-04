import React, { useMemo } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';

import { Applicant } from './ApplicantsTab';
import { PipelineColumn } from './PipelineColumn';

interface PipelineViewProps {
  applicants: Applicant[];
}

export function PipelineView({ applicants }: PipelineViewProps) {
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
        id: 'Shortlisted',
        apiStatus: 'Shortlisted',
        border: 'border-app-indigo-1',
        dot: 'bg-app-indigo-1',
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
        id: 'Declined',
        apiStatus: 'Declined',
        border: 'border-app-red-1',
        dot: 'bg-app-red-1',
      },
    ] as const;

    return columns.map((col) => ({
      ...col,
      items: applicants.filter((applicant) => applicant.status === col.apiStatus),
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
          />
        ))}
      </View>
    </ScrollView>
  );
}
