import StringifiedClass from './stringifiedClass';

export default class RpcAlert<T = unknown> extends StringifiedClass {

  constructor(
    public alert: string,
    public params: T
  ) {
    super();
  }

}
