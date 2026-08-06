import React, { type ReactNode } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  type KeyboardAvoidingViewProps,
} from 'react-native';

import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';

type KeyboardAwareViewProps = KeyboardAvoidingViewProps & {
  className?: string;
  children?: ReactNode;
};

export function KeyboardAwareView({
  children,
  onStartShouldSetResponderCapture,
  style,
  ...props
}: KeyboardAwareViewProps) {
  const keyboardHeight = useKeyboardHeight();

  return (
    <KeyboardAvoidingView
      {...props}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[
        style,
        keyboardHeight > 0 ? { paddingBottom: keyboardHeight } : undefined,
      ]}
      onStartShouldSetResponderCapture={(event) => {
        Keyboard.dismiss();
        onStartShouldSetResponderCapture?.(event);
        return false;
      }}
    >
      {children}
    </KeyboardAvoidingView>
  );
}
