import { Duplex } from 'stream';
import UserService from '@server/services/user.service';
import MessageService from '@server/services/message.service';
import RpcService from '@server/services/rpc.service';
import WebsocketService from '@server/services/websocket.service';
import ConfigService from '@server/services/config.service';
import AlertService from '@server/services/alert.service';

export default class Chat {

  public readonly rpcService: RpcService = new RpcService();
  public readonly userService: UserService = new UserService();
  public readonly messageService: MessageService = new MessageService();
  private configService: ConfigService = new ConfigService();
  private websocketService: WebsocketService = new WebsocketService(this.configService.config.port);
  private alertService: AlertService = new AlertService();

  constructor() {
    this.websocketService.request$.subscribe(async ([connection, requestBuffer]) => {
      const response = await this.rpcService.handleRequest(connection, requestBuffer);

      if (response) {
        this.websocketService.sendMessage(Buffer.from(response.toString()), connection);
      }
    });

    this.websocketService.terminatedConnection$.subscribe((connection) => {
      this.userService.logout(connection);
    });

    this.alertService.onAlert$.subscribe(async ([excludedUser, request]) => {
      let connections: Duplex[];
      if (excludedUser) {
        connections = this.userService.getConnectionsWithoutExcludeUser(excludedUser);
      } else {
        connections = this.userService.getAuthenticatedConnections();
      }

      connections.forEach((connection) => {
        this.websocketService.sendMessage(Buffer.from(request.toString()), connection);
      });
    });
  }

}
