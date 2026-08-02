import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Send } from 'lucide-react-native';
import { COLORS } from '@/app/constants/theme';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <View className="flex-row items-end p-2 border-t border-app-border-3 bg-white">
      <TextInput
        className="flex-1 min-h-10 max-h-24 rounded-2xl bg-app-border-3 px-4 py-2 text-base text-app-slate-1"
        placeholder="Reply message"
        placeholderTextColor={COLORS.slate400}
        value={text}
        onChangeText={setText}
        multiline
        editable={!disabled}
        returnKeyType="default"
      />
      <TouchableOpacity
        testID="send-button"
        className={`ml-2 h-10 w-10 rounded-full items-center justify-center ${
          disabled || !text.trim() ? 'bg-app-border-3' : 'bg-app-accent'
        }`}
        onPress={handleSend}
        disabled={disabled || !text.trim()}
        activeOpacity={0.7}
      >
        {disabled ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Send
            size={18}
            color={!text.trim() ? COLORS.slate400 : COLORS.white}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default MessageInput;
