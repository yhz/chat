import { MaxMessageLength, MaxUsernameLength, RpcAlertName, RpcMethodName } from '@shared/constants';
import User from '@shared/user.entity';
import Message from '@shared/message.entity';
import Chat from '@server/chat';
import RpcError from './common/rpc.error';
import { normalizeInput } from './common/helpers';

const chat = new Chat();

chat.rpcService.registerMethod<string, string>(
  RpcMethodName.Login,
  async (socket, name) => {
    const normalizedName = normalizeInput(name, MaxUsernameLength);
    const token = await chat.userService.login(socket, normalizedName);
    return token;
  }
);

chat.rpcService.registerMethod<string, User>(
  RpcMethodName.LoginByToken,
  async (socket, token) => {
    const user = await chat.userService.loginByToken(socket, token);
    return user;
  }
);

chat.rpcService.registerMethod<void, boolean>(
  RpcMethodName.Logout,
  async (socket) => {
    return await chat.userService.logout(socket);
  }
);

chat.rpcService.registerMethod<unknown, User[]>(
  RpcMethodName.GetUserList,
  async (socket) => {
    return chat.userService.getUserList(socket);
  }
);

chat.rpcService.registerMethod<string, boolean>(
  RpcMethodName.PushMessage,
  async (socket, content) => {
    const normalizedMessage = normalizeInput(content, MaxMessageLength);
    return await chat.messageService.pushMessage(socket, normalizedMessage);
  }
);

chat.rpcService.registerMethod<[number, number], Message[]>(
  RpcMethodName.GetMessages,
  async (socket, [limit, offset]) => {
    return await chat.messageService.getMessages(limit, offset, socket);
  }
);

chat.rpcService.registerAlert(RpcAlertName.LoggedIn);
chat.rpcService.registerAlert(RpcAlertName.LoggedOut);
chat.rpcService.registerAlert(RpcAlertName.PushedMessage);
