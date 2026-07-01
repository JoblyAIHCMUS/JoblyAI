import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ApiKeyGuard } from './auth/api-key.guard';
import { McpKeysService } from './keys/mcp-keys.service';
import { McpKeysController } from './keys/mcp-keys.controller';
import { McpEndpointController } from './server/mcp-endpoint.controller';

@Module({
  imports: [AuthModule, AiModule, NotificationsModule],
  providers: [ApiKeyGuard, McpKeysService],
  controllers: [McpKeysController, McpEndpointController],
  exports: [],
})
export class McpModule {}
