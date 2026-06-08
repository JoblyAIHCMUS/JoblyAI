import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

interface CompanyAboutProps {
  description: string | null;
}

// Custom tag styles for RenderHtml (matching web and job details page)
const htmlTagStyles: Record<string, Record<string, unknown>> = {
  body: { color: '#0F172A', fontSize: 16, lineHeight: 20 },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
    color: '#0F172A',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#0F172A',
  },
  p: { marginTop: 8, marginBottom: 8 },
  ul: { paddingLeft: 8 },
  ol: { paddingLeft: 8 },
  li: { marginBottom: 4 },
  strong: { fontWeight: '700' },
  em: { fontStyle: 'italic' },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#CBD5E1',
    paddingLeft: 12,
    fontStyle: 'italic',
    color: '#475569',
  },
  code: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  pre: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
};

export function CompanyAbout({ description }: CompanyAboutProps) {
  const { width: screenWidth } = useWindowDimensions();
  const htmlContentWidth = screenWidth - 32; // Subtract padding

  if (!description) {
    return (
      <View className="px-4 pb-8">
        <Text className="text-sm text-slate-500 text-center">
          No company description available.
        </Text>
      </View>
    );
  }

  return (
    <View className="px-4 pb-8">
      <Text className="text-2xl font-bold text-slate-900 mb-4">About</Text>
      <View className="bg-slate-50 rounded-lg p-4">
        <RenderHtml
          contentWidth={htmlContentWidth}
          source={{
            html: description,
          }}
          tagsStyles={htmlTagStyles}
        />
      </View>
    </View>
  );
}
