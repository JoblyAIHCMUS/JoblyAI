import React from 'react';
import { Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { MoreHorizontal } from 'lucide-react-native';

import { Applicant } from './ApplicantsTab';
import { PipelineCard } from './PipelineCard';

interface PipelineColumnProps {
  title: string;
  applicants: Applicant[];
  borderColor: string;
  dotColor: string;
}

export function PipelineColumn({
  title,
  applicants,
  borderColor,
  dotColor,
}: PipelineColumnProps) {
  const { width } = useWindowDimensions();

  return (
    <View style={{ width: width - 32 }} className="mx-2">
      <View className="border border-app-border-2 bg-white">
        <View
          className={`rounded-sm mt-2 mx-2 mb-4 border-x border-b bg-white p-3 border-t-4 ${borderColor}`}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className={`mr-2 h-2 w-2 rounded-full ${dotColor}`} />
              <Text className="text-base font-semibold text-app-slate-1">
                {title}
              </Text>
              <View className="ml-2 bg-app-indigo-soft px-2 py-0.5">
                <Text className="text-base font-medium text-app-indigo-strong">
                  {applicants.length}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MoreHorizontal size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mx-2 mb-2">
          {applicants.map((applicant) => (
            <PipelineCard key={applicant.id} applicant={applicant} />
          ))}
        </View>
      </View>
    </View>
  );
}
