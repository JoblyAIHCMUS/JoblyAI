import * as React from 'react';
import { View } from 'react-native';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Text } from '../../../components/ui/text';
import { cn } from '../../../lib/utils';
import { COLORS } from '../../constants/theme';

export interface AuthTextInputProps extends React.ComponentProps<typeof Input> {
  label?: string;
  error?: string;
}

export const TextInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  AuthTextInputProps
>(({ label, error, className, ...props }, ref) => (
  <View className="mb-2">
    {label && (
      <Label
        className={cn(
          'mb-1 text-sm font-semibold text-[#333333] font-inter',
          error && 'text-destructive'
        )}
      >
        {label}
      </Label>
    )}
    <Input
      ref={ref}
      aria-invalid={!!error}
      className={cn(
        'h-14 rounded-lg border-[#D0D5DD] bg-white px-4 py-3 text-base text-black font-inter',
        error && 'border-destructive text-destructive',
        className
      )}
      placeholderTextColor={COLORS.textLight}
      {...props}
    />
    {error && <Text className="text-destructive text-xs mt-1">{error}</Text>}
  </View>
));
TextInput.displayName = 'TextInput';
