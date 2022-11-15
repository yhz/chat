import { Duplex } from 'stream';
import User from '@shared/user.entity';
import { deserializeEntity } from '@shared/helpers';
import { RpcAlertName } from '@shared/constants';
import { Service } from '@server/common/service.decorator';
import RpcError from '@server/common/rpc.error';
import UserSocketCollection from '@server/common/userSocketCollection';
import JwtService from '@server/services/jwt.service';
import AlertService from '@server/services/alert.service';
import { BadTokenErrorMessage } from '@shared/constants';

@Service
export default class UserService {

  private jwtService: JwtService = new JwtService();
  private userSocketCollection: UserSocketCollection = new UserSocketCollection();
  private alertService: AlertService = new AlertService();

  public async login(connection: Duplex, name: string): Promise<string> {
    this.checkConnectionIsAlreadyUse(connection);

    const user = new User(name);
    const token = this.jwtService.signUser(user);
    const isExistUser = this.userSocketCollection.hasUser(user);

    this.userSocketCollection.addSocketToUser(connection, user);

    if (!isExistUser) {
      this.alertService.notify(RpcAlertName.LoggedIn, user, user);
    }

    return token;
  }

  public async loginByToken(connection: Duplex, token: string): Promise<User> {
    this.checkConnectionIsAlreadyUse(connection);

    const decodedToken = await this.jwtService.decodeToken(token);
    if(!decodedToken || !decodedToken.user) {
      throw new RpcError(BadTokenErrorMessage);
    }

    const user = deserializeEntity(User, decodedToken.user);
    const isAlreadyExistUser = this.userSocketCollection.hasUser(user);
    this.userSocketCollection.addSocketToUser(connection, user);

    if (!isAlreadyExistUser) {
      this.alertService.notify(RpcAlertName.LoggedIn, user, user);
    }

    return user;
  }

  public logout(connection: Duplex): boolean {
    const user = this.userSocketCollection.getUserBySocket(connection);
    const isDeletedConnection = this.userSocketCollection.deleteSocket(connection);

    if (user && isDeletedConnection) {
      const isStillExistUser = this.userSocketCollection.hasUser(user);
      if (!isStillExistUser) {
        this.alertService.notify(RpcAlertName.LoggedOut, user);
      }
    }

    return isDeletedConnection;
  }

  public getUserList(connection: Duplex): User[] {
    this.checkIsAuthenticated(connection);

    return this.userSocketCollection.getUsers();
  }

  public getUserByConnection(connection: Duplex): User | null {
    return this.userSocketCollection.getUserBySocket(connection);
  }

  public getConnectionsWithoutExcludeUser(user: User): Duplex[] {
    const allConnections = this.userSocketCollection.getSockets();
    const connectionsOfExcludedUser = new Set(this.userSocketCollection.getSocketsByUser(user));

    return allConnections.filter((connection) => {
      return !connectionsOfExcludedUser.has(connection);
    });
  }

  public getAuthenticatedConnections(): Duplex[] {
    return this.userSocketCollection.getSockets();
  }

  public checkIsAuthenticated(connection: Duplex): void {
    if(!this.userSocketCollection.hasSocket(connection)) {
      throw new RpcError('Authentication required');
    }
  }

  private checkConnectionIsAlreadyUse(connection: Duplex): void {
    if (this.userSocketCollection.hasSocket(connection)) {
      throw new RpcError('Connection is used by already logged in user');
    }
  }

}
