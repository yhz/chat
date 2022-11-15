import { Duplex } from 'stream';

export interface ChatConfig {
  port: number;
  serverRootPath: string;
  storePath: string;
  privateKeyPath: string;
}

export type RpcMethodHandler<T = any, R = any> = (connection: Duplex, params: T) => Promise<R>;
