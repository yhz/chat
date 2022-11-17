import StringifiedObject from '@shared/stringifiedObject';

export default class RpcRequest<T = unknown> extends StringifiedObject {

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
