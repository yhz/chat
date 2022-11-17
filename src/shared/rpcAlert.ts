import StringifiedObject from '@shared/stringifiedObject';

export default class RpcAlert<T = unknown> extends StringifiedObject {

  constructor(
    public alert: string,
    public params: T
  ) {
    super();
  }

}
