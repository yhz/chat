import { Injectable } from '@angular/core';
import { filter, map, Observable, tap } from 'rxjs';
import Message from '@shared/message.entity';
import EntityCollection from '@shared/entityCollection';
import { ApiFacade } from '@client/services/api.facade';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private readonly messages: EntityCollection<Message> = new EntityCollection();
  public readonly messages$: Observable<Message[]> = this.messages.onChanges$.pipe(
    map((messageMap) => Array.from(messageMap.values()))
  );

  constructor(
    private apiFacade: ApiFacade,
  ) {
    this.listenNewMessageAlert().subscribe();
  }

  public pushMessage(content: string): Observable<boolean> {
    return this.apiFacade
      .pushMessage(content)
      .pipe(filter(Boolean));
  }

  public fetchMessagesWithOverwrite(limit: number, offset: number): Observable<Message[]> {
    return this.apiFacade.getMessages(limit, offset).pipe(
      tap((messages) => this.messages.overwriteAll(messages))
    );
  }

  public fetchMessages(limit: number, offset: number): Observable<Message[]> {
    return this.apiFacade.getMessages(limit, offset).pipe(
      tap(this.messages.setMultiple.bind(this.messages)),
    );
  }

  public fetchOlderMessages(count: number): Observable<Message[]> {
    const offset = this.messages.size;
    return this.apiFacade.getMessages(count, offset).pipe(
      tap(this.messages.setMultiple.bind(this.messages)),
    );
  }

  private listenNewMessageAlert(): Observable<Message> {
    return this.apiFacade.pushMessage$.pipe(
      tap(this.messages.set.bind(this.messages)),
    );
  }

}
