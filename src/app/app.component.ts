import { ChangeDetectionStrategy, Component } from '@angular/core';
import { filter, interval, map, Observable, skipWhile, switchMap, takeUntil } from 'rxjs';
import { WebsocketService } from '@client/services/websocket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {

  public readonly isDisconnected$: Observable<boolean> = this.websocketService.isConnected$.pipe(
    map((isConnected) => !isConnected),
  );

  public readonly connectingTitle$: Observable<string> = this.isDisconnected$.pipe(
    filter(Boolean),
    switchMap(() => interval(700)),
    map((intervalCount) => {
      const repeatCount = intervalCount % 4;
      return 'connecting' + '.'.repeat(repeatCount);
    }),
    takeUntil(
      this.isDisconnected$.pipe(skipWhile(Boolean))
    )
  );

  constructor(
    private websocketService: WebsocketService
  ) {}

}
