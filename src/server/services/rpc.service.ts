import { Duplex } from 'stream';
import { RpcAlertName, RpcMethodName } from '@shared/constants';
import RpcResponse from '@shared/rpcResponse';
import { RpcMethodHandler } from '@server/common/interfaces';
import RpcError from '@server/common/rpc.error';

export default class RpcService {

  public readonly registeredMethods: Map<string, RpcMethodHandler> = new Map();
  public readonly registeredAlerts: Set<string> = new Set();

  public async handleRequest(connection: Duplex, request: Buffer): Promise<RpcResponse<unknown> | null> {
    let method, uuid, parameters;

    try {
      const parsedRequest = JSON.parse(request.toString());
      method = parsedRequest.method;
      uuid = parsedRequest.uuid;
      parameters = parsedRequest.params;
    } catch {
      return null;
    }

    if (method && this.registeredMethods.has(method)) {
      let result = null;
      let errorMessage;

      try {
        const handler = this.getMethod(method);
        result = await handler.apply(null, [connection, parameters]);
      } catch (error) {
        if (error instanceof RpcError) {
          errorMessage = error.message;
        } else {
          throw error;
        }
      }

      if (uuid) {
        return new RpcResponse(result, uuid, errorMessage);
      }
    }

    return null;
  }

  public registerMethod<T, R>(method: RpcMethodName, handler: RpcMethodHandler<T, R>): void {
    this.registeredMethods.set(method, handler);
  }

  public registerAlert(name: RpcAlertName): void {
    this.registeredAlerts.add(name);
  }

  private getMethod(name: string): RpcMethodHandler {
    const handler = this.registeredMethods.get(name);
    if (!handler) {
      throw new RpcError('Method is not registered');
    }

    return handler;
  }

}
