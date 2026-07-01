// chuyển promt từ QuestionExtractorService sang đay
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExtractQuestionPromptBuilder {
  build(
    searchDocuments: Array<{
      title?: string;
      url?: string;
      content?: string;
      source?: string;
    }>
  ): string {
    return `
        You are a recruitment expert and an AI assistant. Your task is to generate interview questions based on the provided job description and resume content.
        You are extracting interview questions from retrieved web documents.
        Input documents:
        ${JSON.stringify(searchDocuments, null, 2)}

        Task:
        - Extract only interview questions that already exist in the documents.
        - Preserve the original wording whenever possible.
        - Preserve the source URL for each question.
        - Preserve surrounding context from the document.
        - Never invent questions.
        - Never summarize.
        - Skip duplicate questions from the same document.
        - Return JSON only.
        - Use the document's source field when present; otherwise use the document title as the source.

        Output format:
        [{
        "question": "",
        "source": "",
        "url": "",
        "context": ""
        }]
        `.trim();
  }
}
