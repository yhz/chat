import { Injectable } from '@angular/core';
import { filter, map, Observable } from 'rxjs';
import User from '@shared/user.entity';
import Message from '@shared/message.entity';
import { RpcAlertName, RpcMethodName } from '@shared/constants';
import { deserializeEntity } from '@shared/helpers';
import { RpcService } from '@client/services/rpc.service';

@Injectable({
  providedIn: 'root'
})
export class ApiFacade {

  public readonly pushMessage$: Observable<Message> = this.getAlertListener(RpcAlertName.PushedMessage, Message);
  public readonly loggedIn$: Observable<User> = this.getAlertListener(RpcAlertName.LoggedIn, User);
  public readonly loggedOut$: Observable<User> = this.getAlertListener(RpcAlertName.LoggedOut, User);

  constructor(
    private rpcService: RpcService,
  ) {}

  public login(username: string): Observable<string> {
    return this.rpcService.send<string, string>(
      RpcMethodName.Login,
      username
    );
  }

  public loginByToken(token: string): Observable<User> {
    return this.rpcService.send<string, User>(
      RpcMethodName.LoginByToken,
      token
    ).pipe(
      map((userResult) => {
        const user = deserializeEntity(User, userResult);
        return user;
      }),
    );
  }

  public logout(): Observable<boolean> {
    return this.rpcService.send<null, boolean>(
      RpcMethodName.Logout,
      null
    );
  }

  public getUserList(): Observable<User[]> {
    return this.rpcService.send<null, User[]>(
      RpcMethodName.GetUserList,
      null
    ).pipe(
      map((users) => (
        users.map((userObject) => deserializeEntity(User, userObject))
      )),
    );
  }

  public pushMessage(content: string): Observable<boolean> {
    return this.rpcService.send<string, boolean>(
      RpcMethodName.PushMessage,
      content
    );
  }

  public getMessages(limit: number, offset: number): Observable<Message[]> {
    return this.rpcService.send<[number, number], Message[]>(
      RpcMethodName.GetMessages,
      [limit, offset]
    ).pipe(
      map((messages) => (
        messages.map(messageResponse => deserializeEntity(Message, messageResponse))
      )),
    )
  }

  private getAlertListener<T>(
    name: RpcAlertName,
    targetClass: Function & { prototype: T }
  ): Observable<T> {
    return this.rpcService.serverAlert$.pipe(
      filter((message) => message.alert === name),
      map((message) => {
        const entity = message.params;
        return deserializeEntity(targetClass, entity);
      })
    );
  }

}
