import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { delay, filter, map, Observable, ReplaySubject, skipUntil, switchMap, take } from 'rxjs';
import User from '@shared/user.entity';
import Message from '@shared/message.entity';
import { AuthService } from '@client/services/auth.service';
import { UserService } from '@client/services/user.service';
import { MessageService } from '@client/services/message.service';
import { WebsocketService } from '@client/services/websocket.service';
import { MessageInputComponent } from '@client/components/message-input/message-input.component';
import { MessageListComponent } from '@client/components/message-list/message-list.component';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatPageComponent implements OnInit {

  @ViewChild('messageList') messageList?: MessageListComponent;
  @ViewChild('messageInput') messageInput?: MessageInputComponent;

  public readonly messages$: Observable<Message[]> = this.messageService.messages$.pipe(
    map((messages) => messages.sort((a, b) => a.createdAt - b.createdAt))
  );

  public readonly currentUser$: ReplaySubject<User | null> = this.authService.currentUser$;
  public readonly users$: Observable<User[]> = this.userService.users$.pipe(
    map((users) => users.reverse()),
  );

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private messageService: MessageService,
    private websocketService: WebsocketService,
  ) {}

  public ngOnInit(): void {
    this.websocketService.isConnected$.pipe(
      filter(Boolean),
      switchMap(() => this.authService.isAuthenticated$)
    ).subscribe(() => {
      this.userService.fetchAllUsers().subscribe();
      this.messageService.fetchMessagesWithOverwrite(15, 0).subscribe();
      this.messageList?.scrollToBottom();
    });

    this.messages$.pipe(
      take(1),
      delay(0),
    ).subscribe(() => {
      this.messageList?.scrollToBottom();
    });
  }

  public sendMessage(content: string): void {
    this.messageService.pushMessage(content).pipe(
      skipUntil(this.messages$),
    ).subscribe(() => {
      this.messageList?.scrollToBottom();
      this.messageInput?.clearField();
    });
  }

  public fetchOlderMessages(): void {
    this.messageService.fetchOlderMessages(2).subscribe();
  }

  public logout(): void {
    this.authService.logout().subscribe();
  }

}
