import StringifiedClass from './stringifiedClass';

export default class RpcResponse<T> extends StringifiedClass {

  constructor(
    public result: T,
    public uuid?: string,
    public error?: string,
  ) {
    super();
  }

}
