import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { GcsModule } from '../gcs/gcs.module';
import { AiModule } from '../ai/ai.module';
import { ApiKeyGuard } from './auth/api-key.guard';
import { McpKeysService } from './keys/mcp-keys.service';
import { McpKeysController } from './keys/mcp-keys.controller';
import { McpEndpointController } from './server/mcp-endpoint.controller';

@Module({
  imports: [AuthModule, GcsModule, AiModule],
  providers: [ApiKeyGuard, McpKeysService],
  controllers: [McpKeysController, McpEndpointController],
  exports: [],
})
export class McpModule {}
