import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpState } from '../../server/mcp.types';
import { registerGetMyProfileTool } from './get-my-profile.tool';
import { registerListMyResumesTool } from './list-my-resumes.tool';
import { registerSearchJobsTool } from './search-jobs.tool';
import { registerListMyApplicationsTool } from './list-my-applications.tool';
import { registerGenerateUploadUrlTool } from './generate-upload-url.tool';
import { registerCreateResumeRecordTool } from './create-resume-record.tool';
import { registerExtractResumeTextTool } from './extract-resume-text.tool';
import { registerScoreResumeTool } from './score-resume.tool';
import { registerSyncResumeToProfileTool } from './sync-resume-to-profile.tool';
import { registerSaveResumeScoreTool } from './save-resume-score.tool';

export function registerCandidateTools(
  server: McpServer,
  state: McpState
): void {
  // Read-only tools
  registerGetMyProfileTool(server, state);
  registerListMyResumesTool(server, state);
  registerSearchJobsTool(server, state);
  registerListMyApplicationsTool(server, state);

  // Agent-driven resume flow (upload → extract → score → sync → save)
  registerGenerateUploadUrlTool(server, state);
  registerCreateResumeRecordTool(server, state);
  registerExtractResumeTextTool(server, state);
  registerScoreResumeTool(server, state);
  registerSyncResumeToProfileTool(server, state);
  registerSaveResumeScoreTool(server, state);
}
