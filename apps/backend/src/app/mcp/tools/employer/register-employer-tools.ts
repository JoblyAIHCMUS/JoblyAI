import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpState } from '../../server/mcp.types';
import { registerGetMyCompanyTool } from './get-my-company.tool';
import { registerListCategoriesTool } from './list-categories.tool';
import { registerListSkillsTool } from './list-skills.tool';
import { registerListJobsTool } from './list-jobs.tool';
import { registerGetJobTool } from './get-job.tool';
import { registerListApplicantsTool } from './list-applicants.tool';

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
}
