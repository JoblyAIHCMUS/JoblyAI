import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import {
  ChevronRight,
  Eye,
  MessageCircle,
  XCircle,
} from 'lucide-react-native';

import { HiringStage } from '../types';
import { nextStageMap } from '../data';

interface AllApplicationsRowMenuProps {
  visible: boolean;
  onClose: () => void;
  onView: () => void;
  onMessage: () => void;
  onAdvance: () => void;
  onDecline: () => void;
  hiringStage: HiringStage;
  triggerPosition?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isLoading?: boolean;
}

const MENU_WIDTH = 220;

export const AllApplicationsRowMenu: React.FC<AllApplicationsRowMenuProps> = ({
  visible,
  onClose,
  onView,
  onMessage,
  onAdvance,
  onDecline,
  hiringStage,
  triggerPosition,
  isLoading = false,
}) => {
  const nextStage = nextStageMap[hiringStage];

  const items: Array<{
    key: string;
    label: string;
    icon: React.ComponentType<{ size?: number; color?: string; style?: object }>;
    onPress: () => void;
    color: string;
    destructive?: boolean;
  }> = [
    { key: 'view', label: 'View Details', icon: Eye, onPress: onView, color: '#0F172A' },
    {
      key: 'message',
      label: 'Message Candidate',
      icon: MessageCircle,
      onPress: onMessage,
      color: '#0F172A',
    },
  ];

  if (nextStage) {
    items.push({
      key: 'advance',
      label: `Advance to ${nextStage}`,
      icon: ChevronRight,
      onPress: onAdvance,
      color: '#0F172A',
    });
  }

  items.push({
    key: 'decline',
    label: 'Decline',
    icon: XCircle,
    onPress: onDecline,
    color: '#EF4444',
    destructive: true,
  });

  const menuLeft = triggerPosition
    ? triggerPosition.x + triggerPosition.width - MENU_WIDTH + 16
    : 0;
  const menuTop = triggerPosition
    ? triggerPosition.y + triggerPosition.height + 8
    : 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose}>
        <View className="flex-1 bg-black/0">
          <View
            style={{
              position: 'absolute',
              left: menuLeft,
              top: menuTop,
              width: MENU_WIDTH,
            }}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View className="bg-white rounded-2xl px-4 py-2 shadow-2xl border border-app-slate-2">
                {items.map((item, index) => {
                  const Icon = item.icon;
                  const isLast = index === items.length - 1;
                  const isLastBeforeDecline = item.key === 'decline';
                  return (
                    <React.Fragment key={item.key}>
                      {!isLast && isLastBeforeDecline && (
                        <View className="h-px bg-app-border-2 my-1" />
                      )}
                      <TouchableOpacity
                        disabled={isLoading}
                        onPress={() => {
                          item.onPress();
                          onClose();
                        }}
                        className="flex-row items-center py-3 px-2"
                      >
                        <Icon
                          size={20}
                          color={item.color}
                          style={{ marginRight: 12, minWidth: 20 }}
                        />
                        <Text
                          className={`text-base ${
                            item.destructive
                              ? 'font-semibold text-app-red-1'
                              : 'font-medium text-app-slate-1'
                          }`}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    </React.Fragment>
                  );
                })}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
