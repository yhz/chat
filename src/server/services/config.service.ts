import * as path from 'path';
import { config as dotenvConfig } from 'dotenv';
import { Service } from '@server/common/service.decorator';
import { ChatConfig } from '@server/common/interfaces';

@Service
export default class ConfigService {

  public readonly config: ChatConfig = this.initConfig();

  public initConfig(): ChatConfig {
    dotenvConfig();

    const port = process.env['PORT'] && Number(process.env['PORT']) || 8080;
    const serverRootPath = process.env['SERVER_ROOT_PATH'] ?? './';
    const storePath = path.join(serverRootPath, 'store');
    const privateKeyPath = path.join(serverRootPath, 'private.key');

    const config = { port, serverRootPath, storePath, privateKeyPath };
    Object.freeze(config);

    return config;
  }

}
