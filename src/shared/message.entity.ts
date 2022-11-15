import StringifiedClass from './stringifiedClass';
import User from './user.entity';

export default class Message extends StringifiedClass {

  public readonly createdAt: number;

  constructor(
    public readonly user: User,
    public readonly content: string,
    public readonly uuid: string = '',
  ) {
    super();
    this.uuid = this.uuid || crypto.randomUUID();
    this.createdAt = Date.now();
  }

}
