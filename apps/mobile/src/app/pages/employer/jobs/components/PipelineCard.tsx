import React, { useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Star, MoreHorizontal } from 'lucide-react-native';

import { formatDate } from '../../../../../utils/date';
import Avatar from '../../../../../components/Avatar';
import { Applicant, ApplicantStatus } from './ApplicantsTab';
import { PipelineCardMenu } from './PipelineCardMenu';
import { ChangeStageModal } from './ChangeStageModal';
import { ConfirmStageChangeModal } from '../../../../../components/ConfirmStageChangeModal';
import { COLORS } from '../../../../constants/theme';

interface PipelineCardProps {
  applicant: Applicant;
  onUpdateStage?: (applicantId: string, newStage: ApplicantStatus) => void;
  isUpdating?: boolean;
}

export function PipelineCard({
  applicant,
  onUpdateStage,
  isUpdating = false,
}: PipelineCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingNewStage, setPendingNewStage] =
    useState<ApplicantStatus | null>(null);
  const moreButtonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const [triggerPosition, setTriggerPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

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

  const handleSelectStage = (newStage: ApplicantStatus) => {
    setIsStageModalOpen(false);
    setPendingNewStage(newStage);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmStageChange = () => {
    if (pendingNewStage && onUpdateStage) {
      onUpdateStage(applicant.id, pendingNewStage);
      setIsConfirmModalOpen(false);
      setPendingNewStage(null);
    }
  };

  const handleCancelConfirm = () => {
    setIsConfirmModalOpen(false);
    setPendingNewStage(null);
  };

  return (
    <>
      <View className="mb-4 rounded-sm border border-app-border-1 bg-white p-4 shadow-sm">
        <View className="mb-5 flex-row items-center">
          <Avatar
            url={applicant.avatarUrl}
            name={applicant.name}
            size={48}
            className="mr-4"
          />
          <View className="min-w-0 flex-1">
            <Text className="truncate text-base font-semibold text-app-slate-1">
              {applicant.name}
            </Text>
          </View>

          {applicant.status !== 'Rejected' &&
            applicant.status !== 'Withdrawn' && (
              <TouchableOpacity
                ref={moreButtonRef}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={handleMenuPress}
                className="ml-2"
              >
                <MoreHorizontal size={20} color={COLORS.slate500} />
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
                color={
                  applicant.rating > 0 ? COLORS.badgeOrange : COLORS.darkText
                }
                fill={applicant.rating > 0 ? COLORS.badgeOrange : 'transparent'}
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
        onConfirm={handleSelectStage}
      />

      <ConfirmStageChangeModal
        isVisible={isConfirmModalOpen}
        applicantName={applicant.name}
        currentStage={applicant.status}
        newStage={pendingNewStage || applicant.status}
        onCancel={handleCancelConfirm}
        onConfirm={handleConfirmStageChange}
        isUpdating={isUpdating}
      />
    </>
  );
}
