import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ApiKeyGuard } from './auth/api-key.guard';
import { McpKeysService } from './keys/mcp-keys.service';
import { McpKeysController } from './keys/mcp-keys.controller';
import { McpEndpointController } from './server/mcp-endpoint.controller';

@Module({
  imports: [AuthModule],
  providers: [ApiKeyGuard, McpKeysService],
  controllers: [McpKeysController, McpEndpointController],
  exports: [],
})
export class McpModule {}
