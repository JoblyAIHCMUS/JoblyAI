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
import { COLORS } from '../../../../constants/theme';

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
        color: COLORS.brandDark,
      },
      {
        label: 'Edit Job Posting',
        icon: Pencil,
        onPress: onEditJobPosting,
        color: COLORS.brandDark,
      },
    ];

    if (status === 'Draft') {
      baseItems.push({
        label: 'Publish Job Posting',
        icon: Send,
        onPress: onPublishJobPosting,
        color: COLORS.brandDark,
      });
      baseItems.push({
        label: 'Mark as Closed',
        icon: X,
        onPress: onMarkAsClosed,
        color: COLORS.brandDark,
      });
    } else if (status === 'Live') {
      baseItems.push({
        label: 'Revert to Draft',
        icon: ArrowLeftCircle,
        onPress: onRevertToDraft,
        color: COLORS.brandDark,
      });
      baseItems.push({
        label: 'Close Job Posting',
        icon: X,
        onPress: onMarkAsClosed,
        color: COLORS.brandDark,
      });
    } else if (status === 'Closed') {
      baseItems.push({
        label: 'Revert to Draft',
        icon: ArrowLeftCircle,
        onPress: onRevertToDraft,
        color: COLORS.brandDark,
      });
      baseItems.push({
        label: 'Reopen Job Posting',
        icon: Send,
        onPress: onPublishJobPosting,
        color: COLORS.brandDark,
      });
    }

    baseItems.push({
      label: 'Delete',
      icon: Trash2,
      onPress: onDelete,
      color: COLORS.tagRedText,
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
              <View className="bg-white rounded-2xl px-4 py-2 shadow-2xl border border-app-slate-2">
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
                        item.color === COLORS.tagRedText
                          ? 'text-app-red-2'
                          : 'text-app-slate-1'
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
