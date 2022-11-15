import { Injectable } from '@angular/core';
import { filter, ReplaySubject, Subject, take, takeUntil, timer } from 'rxjs';
import { WebsocketReadyState } from '@client/common/constants';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  public readonly isUnavailableServer$: Subject<boolean> = new Subject();
  public readonly readyState$: ReplaySubject<WebsocketReadyState> = new ReplaySubject(1);
  public readonly serverMessage$: Subject<string> = new Subject();

  private socket: WebSocket = this.createConnection();
  private connectionAttempts: number = 0;

  private RETRY_DELAY_TIME = 2000;
  private REQUEST_TIMEOUT = 7000;

  public send(payload: string): void {
    this.readyState$.pipe(
      filter((state) => state === WebsocketReadyState.OPEN),
      take(1),
      takeUntil(timer(this.REQUEST_TIMEOUT))
    ).subscribe(() => {
      this.socket.send(payload);
    });
  }

  private createConnection(): WebSocket {
    this.connectionAttempts++;
    const socket = new WebSocket('ws://localhost:8080');

    const withUpdateReadyState = (listener: Function) => {
      return () => {
        this.readyState$.next(socket.readyState);
        return listener;
      }
    };

    socket.addEventListener('open', withUpdateReadyState(this.onOpen.bind(this)));
    socket.addEventListener('close', withUpdateReadyState(this.onClose.bind(this)));
    socket.addEventListener('message', this.onMessage.bind(this));

    return socket;
  }

  private onOpen(): void {
    this.connectionAttempts = 0;
  }

  private onClose(): void {
    if (this.connectionAttempts >= 3) {
      this.isUnavailableServer$.next(true);
      this.isUnavailableServer$.complete();
    } else {
      setTimeout(() => {
        this.socket = this.createConnection();
      }, this.RETRY_DELAY_TIME);
    }
  }

  private onMessage(socketMessageEvent: MessageEvent<string>): void {
    this.serverMessage$.next(socketMessageEvent.data);
  }

}
