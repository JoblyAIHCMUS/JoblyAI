import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiProviderService {
  private client: GoogleGenAI;
  private readonly logger = new Logger(AiProviderService.name);

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.error('GEMINI_KEY is not defined in environment variables');
    }
    this.client = new GoogleGenAI({
      apiKey: apiKey || '',
    });
  }

  async generateStructuredData<T>(prompt: string, _schema?: any): Promise<T> {
    try {
      this.logger.log('Calling Gemini API (@google/genai) for structured data...');

      const response = await this.client.models.generateContent({
        model: process.env.GEMINI_MAIN_MODEL || 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response from AI');
      }

      try {
        return JSON.parse(text) as T;
      } catch (parseError) {
        this.logger.error(`Failed to parse Gemini response as JSON: ${text}`);
        throw new Error('Invalid JSON response from AI');
      }
    } catch (error: any) {
      this.logger.error(`Gemini API error: ${error.message}`);
      throw error;
    }
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await this.client.models.generateContent({
        model: process.env.GEMINI_MAIN_MODEL || 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return response.text || '';
    } catch (error: any) {
      this.logger.error(`Gemini API text error: ${error.message}`);
      throw error;
    }
  }
}

