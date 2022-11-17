import { Injectable } from '@angular/core';
import { map, Observable, Subject } from 'rxjs';
import RpcRequest from '@shared/rpcRequest';
import RpcResponse from '@shared/rpcResponse';
import RpcAlert from '@shared/rpcAlert';
import { WebsocketService } from '@client/services/websocket.service';

@Injectable({
  providedIn: 'root'
})
export class RpcService {

  public readonly serverAlert$: Subject<RpcAlert<any>> = new Subject();
  private responseSubjects: Map<string, Subject<RpcResponse<unknown>>> = new Map();

  constructor(
    private websocketService: WebsocketService,
  ) {
    this.websocketService.serverMessage$.subscribe((message: string) => {
      const parsedMessage = this.parseServerMessage(message);

      if (parsedMessage instanceof RpcResponse) {
        this.reportAnResponse(parsedMessage);
      } else if (parsedMessage instanceof RpcAlert) {
        this.serverAlert$.next(parsedMessage)
      }
    });
  }

  public send<Params, Result>(
    method: string,
    params: Params,
    withoutResponse: boolean = false,
  ): Observable<Result> {
    const request = new RpcRequest<Params>(method, params, withoutResponse);
    const response$: Subject<RpcResponse<Result>> = new Subject();

    this.websocketService.send(request.toString());

    if (request.uuid) {
      this.responseSubjects.set(request.uuid, response$ as Subject<RpcResponse<unknown>>);
    }

    return response$.pipe(
      map((response) => response.result)
    );
  }

  private reportAnResponse(response: RpcResponse<any>): void {
    if (response.uuid) {
      const responseSubject$ = this.responseSubjects.get(response.uuid);

      if (responseSubject$) {
        if (response.error) {
          responseSubject$.error(new Error(response.error));
        } else {
          responseSubject$.next(response);
          responseSubject$.complete();
        }

        this.responseSubjects.delete(response.uuid);
      }
    }
  }

  private parseServerMessage(message: string): RpcResponse<unknown> | RpcAlert | null {
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message);
    } catch {
      throw new Error(`Unable to parse a message from the server [${message}]`);
    }

    let result = null;
    if (parsedMessage.uuid) {
      result = new RpcResponse(
        parsedMessage.result,
        parsedMessage.uuid,
        parsedMessage.error,
      );
    } else if (parsedMessage.alert && parsedMessage.params) {
      result = new RpcAlert(
        parsedMessage.alert,
        parsedMessage.params
      );
    }

    return result;
  }

}
