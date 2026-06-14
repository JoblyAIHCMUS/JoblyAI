import React, { createContext, useContext } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('Tabs subcomponents must be used inside <Tabs>');
  }
  return ctx;
}

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export function Tabs({ value, onValueChange, children }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      {children}
    </TabsContext.Provider>
  );
}

export function TabsList({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-row border-b border-app-border-2">{children}</View>
  );
}

interface TabsTriggerProps {
  value: string;
  label: string;
}

export function TabsTrigger({ value, label }: TabsTriggerProps) {
  const { value: active, onValueChange } = useTabsContext();
  const isActive = active === value;

  return isActive ? (
    <View className="mr-6 pb-2 border-b-2 border-app-primary-2">
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onValueChange(value)}
      >
        <Text className="text-app-primary-2 font-semibold text-base">
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  ) : (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onValueChange(value)}
      className="mr-6 pb-2"
    >
      <Text className="text-app-text-3 font-semibold text-base">{label}</Text>
    </TouchableOpacity>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

export function TabsContent({ value, children }: TabsContentProps) {
  const { value: active } = useTabsContext();
  if (active !== value) return null;
  return <View>{children}</View>;
}
