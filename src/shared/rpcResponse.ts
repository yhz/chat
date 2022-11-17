import StringifiedObject from '@shared/stringifiedObject';

export default class RpcResponse<T> extends StringifiedObject {

  constructor(
    public result: T,
    public uuid?: string,
    public error?: string,
  ) {
    super();
  }

}
