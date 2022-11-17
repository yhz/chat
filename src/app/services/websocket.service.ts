import { Injectable } from '@angular/core';
import {
  Observable,
  delay,
  filter,
  map,
  ReplaySubject,
  Subject,
  take,
  takeUntil,
  timer,
  distinctUntilChanged
} from 'rxjs';
import { environment } from '@environments/environment';
import { WebsocketReadyState } from '@client/common/constants';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  public readonly readyState$: ReplaySubject<WebsocketReadyState> = new ReplaySubject(1);
  public readonly isConnected$: Observable<boolean> = this.readyState$.pipe(
    map((state) => state === WebsocketReadyState.OPEN),
    distinctUntilChanged(),
  );

  public readonly serverMessage$: Subject<string> = new Subject();

  private socket: WebSocket = this.createConnection();

  private RETRY_DELAY_TIME = 2000;
  private REQUEST_TIMEOUT = 7000;

  constructor() {
    this.readyState$.pipe(
      filter((state) => state === WebsocketReadyState.CLOSED),
      delay(this.RETRY_DELAY_TIME),
    ).subscribe(this.onClose.bind(this));
  }

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
    const socket = new WebSocket(environment.socketServer);

    const withUpdateReadyState = (listener?: Function) => {
      return () => {
        this.readyState$.next(socket.readyState);
        return listener ?? null;
      }
    };

    socket.addEventListener('open', withUpdateReadyState());
    socket.addEventListener('close', withUpdateReadyState(this.onClose.bind(this)));
    socket.addEventListener('message', this.onMessage.bind(this));

    return socket;
  }

  private onClose(): void {
    this.socket = this.createConnection();
  }

  private onMessage(socketMessageEvent: MessageEvent<string>): void {
    this.serverMessage$.next(socketMessageEvent.data);
  }

}
