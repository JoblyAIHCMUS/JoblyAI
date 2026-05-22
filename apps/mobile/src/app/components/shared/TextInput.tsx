import * as React from 'react';
import { View } from 'react-native';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Text } from '../../../components/ui/text';
import { cn } from '../../../lib/utils';
import { COLORS } from '../../constants/theme';

export interface AuthTextInputProps {
  label?: string;
  error?: string;
  placeholder?: string;
  className?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?:
    | 'default'
    | 'email-address'
    | 'numeric'
    | 'number-pad'
    | 'phone-pad';
  secureTextEntry?: boolean;
  editable?: boolean;
  maxLength?: number;
  rightElement?: React.ReactNode;
}

export const TextInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  AuthTextInputProps
>(({ label, error, className, rightElement, ...props }, ref) => (
  <View className="mb-2">
    {label && (
      <Label
        className={cn(
          'mb-1 text-md font-extrabold text-foreground',
          error && 'text-destructive'
        )}
      >
        {label}
      </Label>
    )}
    <View className="relative">
      <Input
        ref={ref}
        aria-invalid={!!error}
        className={cn(
          'h-14 rounded-lg border-input bg-background px-4 py-3 text-base text-foreground',
          error && 'border-destructive text-destructive',
          rightElement && 'pr-12',
          className
        )}
        placeholderTextColor={COLORS.textLight}
        {...props}
      />
      {rightElement && (
        <View className="absolute right-0 top-0 bottom-0 justify-center px-4">
          {rightElement}
        </View>
      )}
    </View>
    {error && <Text className="text-destructive text-xs mt-1">{error}</Text>}
  </View>
));
TextInput.displayName = 'TextInput';
