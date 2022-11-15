import { Duplex } from 'stream';
import User from '@shared/user.entity';

export default class UserSocketCollection {

  private uuids: Map<string, User> = new Map();
  private users: Map<User, Set<Duplex>> = new Map();
  private sockets: Map<Duplex, User> = new Map();

  public deleteUser(inputUser: User): boolean {
    const user = this.getOriginalUser(inputUser);
    const sockets = this.users.get(user);

    if (!sockets) {
      return false;
    }

    for (const socket of sockets) {
      this.sockets.delete(socket);
    }

    return this.users.delete(user);
  }

  public deleteSocket(socket: Duplex): boolean {
    const user = this.sockets.get(socket);

    if (!user) {
      return false;
    }

    const socketsSet = this.users.get(user);
    const isExistSocketInSet = socketsSet?.has(socket);

    if (!socketsSet || !isExistSocketInSet) {
      return false;
    }

    if (socketsSet.size === 1) {
      this.users.delete(user);
    } else {
      socketsSet.delete(socket);
    }

    return this.sockets.delete(socket);
  }

  public hasSocket(socket: Duplex): boolean {
    return this.sockets.has(socket);
  }

  public hasUser(inputUser: User): boolean {
    const user = this.getOriginalUser(inputUser);
    return this.users.has(user);
  }

  public addSocketToUser(socket: Duplex, inputUser: User): void {
    const user = this.getOriginalUser(inputUser);
    this.sockets.set(socket, user);

    let sockets = this.users.get(user);
    if (!sockets) {
      sockets = new Set();
      this.uuids.set(user.uuid, user);
      this.users.set(user, sockets);
    }

    sockets.add(socket);
  }

  public getSocketsByUser(inputUser: User): Duplex[] {
    const user = this.getOriginalUser(inputUser);
    return [...(this.users.get(user)?.values() || [])];
  }

  public getUserBySocket(socket: Duplex): User | null {
    return this.sockets.get(socket) ?? null;
  }

  public getUsers(): User[] {
    return [...this.users.keys()];
  }

  public getSockets(): Duplex[] {
    return [...this.sockets.keys()];
  }

  private getOriginalUser(userCopy: User): User {
    const user = this.uuids.get(userCopy.uuid);

    return user ?? userCopy;
  }

}
