import { View, Text, TouchableOpacity } from 'react-native';

export const TestPage = ({ onBack }: { onBack: () => void }) => {
  return (
    <View className="flex-1 bg-red-500 justify-center items-center p-6">
      <View className="bg-blue-100 rounded-lg p-8 items-center">
        <Text className="text-3xl font-bold text-blue-600 mb-4">Test Page</Text>
        <Text className="text-lg text-gray-700 text-center mb-8">
          This page is styled with Nativewind (Tailwind CSS)
        </Text>

        <View className="bg-blue-50 rounded-lg p-6 mb-8 w-full border-2 border-blue-200">
          <Text className="text-sm font-semibold text-blue-800 mb-2">
            Features Demonstrated:
          </Text>
          <Text className="text-xs text-gray-600 mb-1">• Flexbox layout</Text>
          <Text className="text-xs text-gray-600 mb-1">• Color utilities</Text>
          <Text className="text-xs text-gray-600 mb-1">• Padding & margin</Text>
          <Text className="text-xs text-gray-600">• Border & radius</Text>
        </View>

        <TouchableOpacity
          onPress={onBack}
          className="bg-blue-600 rounded-lg px-8 py-3 active:bg-blue-700"
        >
          <Text className="text-white font-semibold text-center">
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
