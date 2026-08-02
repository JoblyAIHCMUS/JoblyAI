import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Calls backend API POST /api/candidate/export-pdf to generate high-precision vector A4 PDF via Puppeteer.
 */
export async function exportCandidatePdfApi(candidateData: any): Promise<Blob> {
  const response = await axios.post(
    `${API_BASE_URL}/api/candidate/export-pdf`,
    candidateData,
    {
      withCredentials: true,
      responseType: 'blob',
    }
  );

  return response.data;
}
