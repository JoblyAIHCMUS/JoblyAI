import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpState } from '../../server/mcp.types';
import { registerGetMyProfileTool } from './get-my-profile.tool';
import { registerListMyResumesTool } from './list-my-resumes.tool';
import { registerSearchJobsTool } from './search-jobs.tool';
import { registerListMyApplicationsTool } from './list-my-applications.tool';
import { registerApplyToJobTool } from './apply-to-job.tool';
import { registerUpdateProfileTool } from './update-profile.tool';
import { registerWithdrawApplicationTool } from './withdraw-application.tool';

export function registerCandidateTools(
  server: McpServer,
  state: McpState
): void {
  registerGetMyProfileTool(server, state);
  registerListMyResumesTool(server, state);
  registerSearchJobsTool(server, state);
  registerListMyApplicationsTool(server, state);
  registerApplyToJobTool(server, state);
  registerUpdateProfileTool(server, state);
  registerWithdrawApplicationTool(server, state);
}
