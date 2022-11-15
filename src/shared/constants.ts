export enum RpcMethodName {
  Login = 'login',
  LoginByToken = 'loginByToken',
  Logout = 'logout',
  GetUserList = 'getUserList',
  PushMessage = 'pushMessage',
  GetMessages = 'getMessages',
}

export enum RpcAlertName {
  PushedMessage = 'pushedMessage',
  LoggedIn = 'loggedIn',
  LoggedOut = 'loggedOut',
}

export const BadTokenErrorMessage = 'Bad token';
export const MaxMessageLength = 300;
export const MaxUsernameLength = 50;
