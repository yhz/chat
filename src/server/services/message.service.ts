import * as fs from 'fs/promises';
import * as path from 'path';
import { Duplex } from 'stream';
import { RpcAlertName } from '@shared/constants';
import { deserializeEntity } from '@shared/helpers';
import Message from '@shared/message.entity';
import User from '@shared/user.entity';
import EntityCollection from '@shared/entityCollection';
import { Service } from '@server/common/service.decorator';
import UserService from '@server/services/user.service';
import AlertService from '@server/services/alert.service';
import ConfigService from '@server/services/config.service';
import RpcError from '@server/common/rpc.error';

@Service
export default class MessageService {

  private userService: UserService = new UserService();
  private alertService: AlertService = new AlertService();
  private configService: ConfigService = new ConfigService();

  private STORE_DIRECTORY: string = this.configService.config.storePath;
  private COLLECTION_LIMIT = 2500;

  private messages: EntityCollection<Message> = new EntityCollection();

  constructor() {
    this.initStore();
  }

  public async pushMessage(connection: Duplex, content: string): Promise<boolean> {
    const user = this.userService.getUserByConnection(connection);

    if (!user) {
      throw new RpcError('User not found by connection');
    }

    const message = await this.saveMessage(content, user);
    this.alertService.notify(RpcAlertName.PushedMessage, message);

    return true;
  }

  public async getMessages(
    limit: number,
    offset: number,
    connection: Duplex | null
  ): Promise<Message[]> {
    if (connection) {
      this.userService.checkIsAuthenticated(connection);
    }

    const messageInMemory = Array.from(this.messages.values());
    let resultMessages: Message[] = [];

    if (limit + offset <= messageInMemory.length) {
      resultMessages = this.sliceByLimitAndOffset<Message>(messageInMemory, limit, offset);
    } else {
      if (offset < messageInMemory.length) {
        resultMessages = this.sliceByLimitAndOffset<Message>(messageInMemory, limit, offset);
        limit -= resultMessages.length;
        offset += resultMessages.length;
      }

      if (limit <= 0) {
        return resultMessages;
      }

      const allMessageFiles = await fs.readdir(this.STORE_DIRECTORY);
      const slicedDirectory = this.sliceByLimitAndOffset(allMessageFiles, limit, offset);

      for (const filename of slicedDirectory) {
        const filePath = path.join(this.STORE_DIRECTORY, filename);
        const fileBuffer = await fs.readFile(filePath);
        const fileContent = fileBuffer.toString();
        const message = deserializeEntity(Message, JSON.parse(fileContent));
        resultMessages.push(message);
      }
    }

    return resultMessages;
  }

  private async saveMessage(content: string, user: User): Promise<Message> {
    const message = new Message(user, content);
    const { uuid, createdAt } = message;

    const recordPath = this.getMessageRecordPath(uuid, createdAt);
    await fs.writeFile(recordPath, JSON.stringify(message));

    this.messages.set(message);

    return message;
  }

  private async initStore(): Promise<true> {
    await fs.stat(this.STORE_DIRECTORY).catch(() => (
      fs.mkdir(this.STORE_DIRECTORY)
    ));

    const messages = await this.getMessages(this.COLLECTION_LIMIT, 0, null);
    this.messages.overwriteAll(messages);

    return true;
  }

  private getMessageRecordPath(uuid: string, timestamp: number): string {
    return path.join(this.STORE_DIRECTORY, `${timestamp}_${uuid}.json`);
  }

  private sliceByLimitAndOffset<T>(collection: T[], limit: number, offset: number): T[] {
    const collectionLength = collection.length;
    const sliceEnd = collectionLength - offset;
    const sliceStart = sliceEnd - limit;

    return collection.slice(sliceStart, sliceEnd);
  }

}
