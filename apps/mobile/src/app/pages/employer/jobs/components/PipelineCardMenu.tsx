import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { User, MoveRight } from 'lucide-react-native';
import { COLORS } from '../../../../constants/theme';

interface PipelineCardMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onViewProfile: () => void;
  onChangeStage: () => void;
  triggerPosition?: { x: number; y: number; width: number; height: number };
}

export const PipelineCardMenu: React.FC<PipelineCardMenuProps> = ({
  isVisible,
  onClose,
  onViewProfile,
  onChangeStage,
  triggerPosition,
}) => {
  const menuItems = [
    {
      label: 'View Profile',
      icon: User,
      onPress: onViewProfile,
      color: COLORS.brandDark,
    },
    {
      label: 'Change Stage',
      icon: MoveRight,
      onPress: onChangeStage,
      color: COLORS.brandDark,
    },
  ];

  const menuWidth = 220;

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
                    <Text className="text-base font-medium text-app-slate-1">
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
