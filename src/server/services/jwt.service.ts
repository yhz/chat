import * as fs from 'fs';
import * as crypto from 'crypto';
import { promisify } from 'util';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '@shared/interfaces';
import User from '@shared/user.entity';
import { Service } from '@server/common/service.decorator';
import ConfigService from '@server/services/config.service';

@Service
export default class JwtService {

  private readonly configService: ConfigService = new ConfigService();

  private readonly PRIVATE_KEY_PATH: string = this.configService.config.privateKeyPath;
  private readonly TOKEN_EXPIRES_AFTER: string = '1d';

  private privateKeyContent: string = this.getPrivateKey();

  private get privateKey(): string {
    if (!this.privateKeyContent) {
      this.privateKeyContent = this.getPrivateKey();
    }

    return this.privateKeyContent;
  }

  public signUser(user: User): Promise<string> {
    const sign = promisify<object, jwt.Secret, jwt.SignOptions, string>(jwt.sign);

    return sign({ user }, this.privateKey, {
      expiresIn: this.TOKEN_EXPIRES_AFTER,
    });
  }

  public async decodeToken(token: string): Promise<JwtPayload | null> {
    const verify = promisify<string, jwt.Secret, jwt.VerifyOptions, JwtPayload | null>(jwt.verify);

    return await verify(token, this.privateKey, {}).catch(() => null);
  }

  private getPrivateKey(): string {
    let privateKey: string;
    try {
      privateKey = fs.readFileSync(this.PRIVATE_KEY_PATH)?.toString();

      if (!privateKey.trim().length) {
        throw new Error('Private key is empty');
      }
    } catch {
      privateKey = this.generatePrivateKey();
      fs.writeFileSync(this.PRIVATE_KEY_PATH, privateKey);
    }

    return privateKey;
  }

  private generatePrivateKey(): string {
    const { privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });

    return privateKey.export({
      format: 'pem',
      type: 'pkcs1',
    }).toString();
  }

}
