import { Observable, Subject } from 'rxjs';
import Message from './message.entity';

export default class MessageCollection {

  private valueChanges$: Subject<Message> = new Subject();
  public readonly messages: Map<string, Message> = new Map();
  public readonly onChanges$: Observable<Message> = this.valueChanges$.asObservable();

  constructor(
    public readonly maxSize: number,
  ) {}

  public push(message: Message, withoutEmit: boolean = false): number {
    if (this.maxSize && this.maxSize === this.messages.size) {
      const firstMessageInCollection: Message = this.messages.values().next()?.value;
      const uuid = firstMessageInCollection.uuid;
      this.messages.delete(uuid);
    }

    this.messages.set(message.uuid, message);

    if (!withoutEmit) {
      this.valueChanges$.next(message);
    }

    return this.messages.size;
  }

}
