import React, { type ReactNode } from 'react';
import { Keyboard, View, type ViewProps } from 'react-native';

type KeyboardDismissViewProps = ViewProps & {
  className?: string;
  children?: ReactNode;
};

export function KeyboardDismissView({
  children,
  onStartShouldSetResponderCapture,
  ...props
}: KeyboardDismissViewProps) {
  return (
    <View
      {...props}
      onStartShouldSetResponderCapture={(event) => {
        Keyboard.dismiss();
        onStartShouldSetResponderCapture?.(event);
        return false;
      }}
    >
      {children}
    </View>
  );
}
