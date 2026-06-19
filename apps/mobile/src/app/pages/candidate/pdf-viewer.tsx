'use client';

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';
import { COLORS } from '../../constants/theme';
import { createDownloadUrl } from '../../../api/s3';

export default function PdfViewerPage() {
  const { fileKey, fileName } = useLocalSearchParams<{
    fileKey: string;
    fileName: string;
  }>();
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fileKey) {
      setError('No file key provided');
      setLoading(false);
      return;
    }

    const fetchUrl = async () => {
      try {
        const result = await createDownloadUrl({ fileKey: fileKey as string });
        setPdfUri(result.downloadUrl);
      } catch {
        setError('Failed to load PDF');
      } finally {
        setLoading(false);
      }
    };

    fetchUrl();
  }, [fileKey]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: fileName || 'PDF Viewer',
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.darkText,
          headerBackTitle: 'Back',
        }}
      />

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading PDF...</Text>
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {pdfUri && !loading && !error && (
        <Pdf
          source={{ uri: pdfUri, cache: true }}
          style={styles.pdf}
          onLoadComplete={(numberOfPages) => {
            console.log(`PDF loaded: ${numberOfPages} pages`);
          }}
          onError={(err) => {
            console.error('PDF error:', err);
            setError('Failed to render PDF');
          }}
          enablePaging={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pdf: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray3,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
});
