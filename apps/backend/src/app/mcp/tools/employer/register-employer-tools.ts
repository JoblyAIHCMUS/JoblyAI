import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpState } from '../../server/mcp.types';
import { registerAddPreShortlistQuestionsTool } from './add-pre-shortlist-questions.tool';
import { registerGetJobTool } from './get-job.tool';
import { registerGetMyCompanyTool } from './get-my-company.tool';
import { registerGetPreShortlistQuestionsTool } from './get-pre-shortlist-questions.tool';
import { registerListApplicantsTool } from './list-applicants.tool';
import { registerListCategoriesTool } from './list-categories.tool';
import { registerListJobsTool } from './list-jobs.tool';
import { registerListSkillsTool } from './list-skills.tool';
import { registerRemovePreShortlistQuestionsTool } from './remove-pre-shortlist-questions.tool';
import { registerUpdatePreShortlistQuestionTool } from './update-pre-shortlist-question.tool';

export function registerEmployerTools(
  server: McpServer,
  state: McpState
): void {
  registerGetMyCompanyTool(server, state);
  registerListCategoriesTool(server, state);
  registerListSkillsTool(server, state);
  registerListJobsTool(server, state);
  registerGetJobTool(server, state);
  registerListApplicantsTool(server, state);
  registerGetPreShortlistQuestionsTool(server, state);
  registerAddPreShortlistQuestionsTool(server, state);
  registerUpdatePreShortlistQuestionTool(server, state);
  registerRemovePreShortlistQuestionsTool(server, state);
}
