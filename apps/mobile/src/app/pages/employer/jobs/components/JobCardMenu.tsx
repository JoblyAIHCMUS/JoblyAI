import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import {
  Eye,
  Pencil,
  Send,
  X,
  Trash2,
  ArrowLeftCircle,
} from 'lucide-react-native';
import { JobStatus } from '../data';

interface JobCardMenuProps {
  isVisible: boolean;
  onClose: () => void;
  status: JobStatus;
  onViewDetails: () => void;
  onEditJobPosting: () => void;
  onPublishJobPosting: () => void;
  onRevertToDraft: () => void;
  onMarkAsClosed: () => void;
  onDelete: () => void;
  triggerPosition?: { x: number; y: number; width: number; height: number };
}

export const JobCardMenu: React.FC<JobCardMenuProps> = ({
  isVisible,
  onClose,
  status,
  onViewDetails,
  onEditJobPosting,
  onPublishJobPosting,
  onRevertToDraft,
  onMarkAsClosed,
  onDelete,
  triggerPosition,
}) => {
  const getMenuItems = () => {
    const baseItems = [
      {
        label: 'View Details',
        icon: Eye,
        onPress: onViewDetails,
        color: '#0F172A',
      },
      {
        label: 'Edit Job Posting',
        icon: Pencil,
        onPress: onEditJobPosting,
        color: '#0F172A',
      },
    ];

    if (status === 'Draft') {
      baseItems.push({
        label: 'Publish Job Posting',
        icon: Send,
        onPress: onPublishJobPosting,
        color: '#0F172A',
      });
      baseItems.push({
        label: 'Mark as Closed',
        icon: X,
        onPress: onMarkAsClosed,
        color: '#0F172A',
      });
    } else if (status === 'Live') {
      baseItems.push({
        label: 'Revert to Draft',
        icon: ArrowLeftCircle,
        onPress: onRevertToDraft,
        color: '#0F172A',
      });
      baseItems.push({
        label: 'Close Job Posting',
        icon: X,
        onPress: onMarkAsClosed,
        color: '#0F172A',
      });
    } else if (status === 'Closed') {
      baseItems.push({
        label: 'Revert to Draft',
        icon: ArrowLeftCircle,
        onPress: onRevertToDraft,
        color: '#0F172A',
      });
      baseItems.push({
        label: 'Reopen Job Posting',
        icon: Send,
        onPress: onPublishJobPosting,
        color: '#0F172A',
      });
    }

    baseItems.push({
      label: 'Delete',
      icon: Trash2,
      onPress: onDelete,
      color: '#DC2626',
    });
    return baseItems;
  };

  const menuItems = getMenuItems();
  const menuWidth = 280;

  let menuLeft = 0;
  let menuTop = 0;

  if (triggerPosition) {
    menuLeft = triggerPosition.x + triggerPosition.width - menuWidth + 16;
    menuTop = triggerPosition.y + triggerPosition.height + 8;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose}>
        <View className="flex-1 bg-black/0">
          <View
            style={{
              position: 'absolute',
              left: menuLeft,
              top: menuTop,
              width: menuWidth,
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View className="bg-white rounded-2xl px-4 py-2 shadow-2xl border border-[#E2E8F0]">
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      item.onPress();
                      onClose();
                    }}
                    className="flex-row items-center py-3 px-2"
                  >
                    <item.icon
                      size={20}
                      color={item.color}
                      style={{ marginRight: 12, minWidth: 20 }}
                    />
                    <Text
                      className={`text-base font-medium ${
                        item.color === '#DC2626'
                          ? 'text-[#DC2626]'
                          : 'text-[#0F172A]'
                      }`}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
