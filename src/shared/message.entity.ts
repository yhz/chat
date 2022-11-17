import StringifiedObject from '@shared/stringifiedObject';
import User from '@shared/user.entity';

export default class Message extends StringifiedObject {

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
