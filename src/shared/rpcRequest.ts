import StringifiedClass from './stringifiedClass';

export default class RpcRequest<T = unknown> extends StringifiedClass {

  public uuid: string | undefined;

  constructor(
    public method: string,
    public params: T,
    withoutResponse: boolean = false,
  ) {
    super();

    if (!withoutResponse) {
      this.uuid = crypto.randomUUID();
    }
  }

}
