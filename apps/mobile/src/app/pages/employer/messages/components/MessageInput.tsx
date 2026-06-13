import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Send } from 'lucide-react-native';

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
        placeholder="Type a message…"
        placeholderTextColor="#94A3B8"
        value={text}
        onChangeText={setText}
        multiline
        editable={!disabled}
        returnKeyType="default"
      />
      <TouchableOpacity
        testID="send-button"
        className={`ml-2 h-10 w-10 rounded-full items-center justify-center ${
          disabled || !text.trim() ? 'bg-app-border-3' : 'bg-app-primary'
        }`}
        onPress={handleSend}
        disabled={disabled || !text.trim()}
        activeOpacity={0.7}
      >
        {disabled ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Send size={18} color={!text.trim() ? '#94A3B8' : '#fff'} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default MessageInput;
