import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MoreHorizontal } from 'lucide-react-native';
import { JobListing } from '../data';
import { JobCardMenu } from './JobCardMenu';
import { DeleteConfirmationModal } from '../../../../../components/DeleteConfirmationModal';
import { useJobActions } from '../../../../../hooks/useEmployerJobs';
import { COLORS } from '../../../../constants/theme';

interface JobCardProps {
  job: JobListing;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const router = useRouter();
  const isLive = job.status === 'Live';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const moreButtonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const [triggerPosition, setTriggerPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const { updateStatus, deleteJob } = useJobActions();

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

  const handleViewDetails = () => {
    setIsMenuOpen(false);
    router.push(`/pages/employer/jobs/${job.id}`);
  };
  const handleEditJobPosting = () => {
    setIsMenuOpen(false);
    router.push(`/pages/employer/edit-job/${job.id}`);
  };

  const handlePublishJobPosting = () => {
    setIsUpdating(true);
    setIsMenuOpen(false);
    updateStatus.mutate(
      { id: job.originalId, status: 'OPEN' },
      {
        onSettled: () => setIsUpdating(false),
      }
    );
  };

  const handleRevertToDraft = () => {
    setIsUpdating(true);
    setIsMenuOpen(false);
    updateStatus.mutate(
      { id: job.originalId, status: 'DRAFT' },
      {
        onSettled: () => setIsUpdating(false),
      }
    );
  };

  const handleMarkAsClosed = () => {
    setIsUpdating(true);
    setIsMenuOpen(false);
    updateStatus.mutate(
      { id: job.originalId, status: 'CLOSED' },
      {
        onSettled: () => setIsUpdating(false),
      }
    );
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteJob.mutate(job.originalId, {
      onError: () => {
        // Error will be handled by the mutation state, but we can add toast/alert if needed
      },
      onSuccess: () => {
        setIsDeleteModalOpen(false);
      },
    });
  };

  if (isUpdating) {
    return (
      <View className="bg-white rounded-xl border border-app-border-2 p-4 mb-4 shadow-sm opacity-60">
        <View className="flex-row justify-between items-center mb-4">
          <Text
            className="text-2xl font-bold text-app-slate-1 flex-1 mr-2"
            numberOfLines={1}
          >
            {job.title}
          </Text>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>

        <View className="flex-row justify-between mb-4 border-b border-app-border-2 pb-4">
          <View>
            <Text className="text-lg text-app-text-3 mb-1 font-medium">
              Date Posted
            </Text>
            <Text className="text-lg text-app-text-3">{job.datePosted}</Text>
          </View>
          <View>
            <Text className="text-lg text-app-text-3 mb-1 font-medium">
              Applicants
            </Text>
            <Text className="text-lg text-app-text-3">{job.applicants}</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-3">
          <View
            className={`px-4 py-1 rounded-full border ${
              isLive
                ? 'border-app-teal-1'
                : job.status === 'Draft'
                ? 'border-app-yellow-1'
                : 'border-app-rose-1'
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                isLive
                  ? 'text-app-teal-1'
                  : job.status === 'Draft'
                  ? 'text-app-yellow-1'
                  : 'text-app-rose-1'
              }`}
            >
              {job.status}
            </Text>
          </View>

          <View
            className={`px-4 py-1 rounded-full border ${
              job.type === 'Fulltime'
                ? 'border-app-indigo-1'
                : 'border-app-orange-1'
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                job.type === 'Fulltime'
                  ? 'text-app-indigo-1'
                  : 'text-app-orange-1'
              }`}
            >
              {job.type}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <>
      <View className="bg-white rounded-xl border border-app-border-2 p-4 mb-4 shadow-sm">
        {/* Top Row */}
        <View className="flex-row justify-between items-center mb-4">
          <Text
            className="text-2xl font-bold text-app-slate-1 flex-1 mr-2"
            numberOfLines={1}
          >
            {job.title}
          </Text>
          <TouchableOpacity
            ref={moreButtonRef}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={handleMenuPress}
          >
            <MoreHorizontal size={24} color={COLORS.brandDark} />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View className="flex-row justify-between mb-4 border-b border-app-border-2 pb-4">
          <View>
            <Text className="text-lg text-app-text-3 mb-1 font-medium">
              Date Posted
            </Text>
            <Text className="text-lg text-app-text-3">{job.datePosted}</Text>
          </View>
          <View>
            <Text className="text-lg text-app-text-3 mb-1 font-medium">
              Applicants
            </Text>
            <Text className="text-lg text-app-text-3">{job.applicants}</Text>
          </View>
        </View>

        {/* Tags Row */}
        <View className="flex-row items-center gap-3">
          <View
            className={`px-4 py-1 rounded-full border ${
              isLive
                ? 'border-app-teal-1'
                : job.status === 'Draft'
                ? 'border-app-yellow-1'
                : 'border-app-rose-1'
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                isLive
                  ? 'text-app-teal-1'
                  : job.status === 'Draft'
                  ? 'text-app-yellow-1'
                  : 'text-app-rose-1'
              }`}
            >
              {job.status}
            </Text>
          </View>

          <View
            className={`px-4 py-1 rounded-full border ${
              job.type === 'Fulltime'
                ? 'border-app-indigo-1'
                : 'border-app-orange-1'
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                job.type === 'Fulltime'
                  ? 'text-app-indigo-1'
                  : 'text-app-orange-1'
              }`}
            >
              {job.type}
            </Text>
          </View>
        </View>
      </View>

      <JobCardMenu
        isVisible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        triggerPosition={triggerPosition}
        status={job.status}
        onViewDetails={handleViewDetails}
        onEditJobPosting={handleEditJobPosting}
        onPublishJobPosting={handlePublishJobPosting}
        onRevertToDraft={handleRevertToDraft}
        onMarkAsClosed={handleMarkAsClosed}
        onDelete={handleDelete}
      />

      <DeleteConfirmationModal
        isVisible={isDeleteModalOpen}
        title="Delete Job Posting"
        description="Are you sure you want to delete this job posting? This action cannot be undone."
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteJob.isPending}
      />
    </>
  );
};
