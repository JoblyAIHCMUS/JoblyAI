import React, { useRef, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Star, MoreHorizontal } from 'lucide-react-native';
import { SvgUri } from 'react-native-svg';

import { formatDate } from '../../../../../utils/date';
import { Applicant, ApplicantStatus } from './ApplicantsTab';
import { PipelineCardMenu } from './PipelineCardMenu';
import { ChangeStageModal } from './ChangeStageModal';

interface PipelineCardProps {
  applicant: Applicant;
  onUpdateStage?: (applicantId: string, newStage: ApplicantStatus) => void;
}

export function PipelineCard({ applicant, onUpdateStage }: PipelineCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const moreButtonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const [triggerPosition, setTriggerPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const isSvg =
    applicant.avatarUrl?.includes('.svg') ||
    applicant.avatarUrl?.includes('/svg');

  const handleMenuPress = () => {
    moreButtonRef.current?.measure(
      (
        x: number,
        y: number,
        width: number,
        height: number,
        pageX: number,
        pageY: number
      ) => {
        setTriggerPosition({ x: pageX, y: pageY, width, height });
        setIsMenuOpen(true);
      }
    );
  };

  const handleViewProfile = () => {
    setIsMenuOpen(false);
    // TODO: wire to profile when route is available
  };

  const handleChangeStage = () => {
    setIsMenuOpen(false);
    setIsStageModalOpen(true);
  };

  const handleConfirmStage = (newStage: ApplicantStatus) => {
    setIsStageModalOpen(false);
    if (onUpdateStage) {
      onUpdateStage(applicant.id, newStage);
    }
  };

  return (
    <>
      <View className="mb-4 rounded-sm border border-app-border-1 bg-white p-4 shadow-sm">
        <View className="mb-5 flex-row items-center">
          {isSvg ? (
            <View className="mr-4 h-12 w-12 overflow-hidden rounded-full bg-app-gray-1">
              <SvgUri width="100%" height="100%" uri={applicant.avatarUrl} />
            </View>
          ) : (
            <Image
              source={{ uri: applicant.avatarUrl }}
              className="mr-4 h-12 w-12 rounded-full bg-app-gray-1"
            />
          )}
          <View className="min-w-0 flex-1">
            <Text className="truncate text-base font-semibold text-app-slate-1">
              {applicant.name}
            </Text>
          </View>
          
          {applicant.status !== 'Rejected' && applicant.status !== 'Withdrawn' && (
            <TouchableOpacity
              ref={moreButtonRef}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={handleMenuPress}
              className="ml-2"
            >
              <MoreHorizontal size={20} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="mb-1 text-xs font-medium text-app-text-3">
            Applied on
          </Text>
          <Text className="text-sm font-semibold text-app-slate-1">
            {formatDate(applicant.appliedDate)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="mb-1 text-xs font-medium text-app-text-3">
            Score
          </Text>
          <View className="flex-row items-center">
            <Star
              size={14}
              color={applicant.rating > 0 ? '#FFB836' : '#111827'}
              fill={applicant.rating > 0 ? '#FFB836' : 'transparent'}
            />
            <Text className="ml-1 text-sm font-semibold text-app-slate-1">
              {applicant.rating.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>
      </View>

      <PipelineCardMenu
        isVisible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        triggerPosition={triggerPosition}
        onViewProfile={handleViewProfile}
        onChangeStage={handleChangeStage}
      />

      <ChangeStageModal
        isVisible={isStageModalOpen}
        onClose={() => setIsStageModalOpen(false)}
        applicantName={applicant.name}
        currentStage={applicant.status}
        onConfirm={handleConfirmStage}
      />
    </>
  );
}
