import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WsAllExceptionsFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger('WsExceptionFilter');

  override catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();

    if (exception instanceof WsException) {
      const error = exception.getError();
      this.logger.warn(
        `WS error from client ${client.id}: ${JSON.stringify(error)}`
      );
    } else {
      this.logger.error(
        `Unhandled WS exception from client ${client.id}`,
        exception instanceof Error ? exception.stack : String(exception)
      );
    }

    super.catch(exception, host);
  }
}
