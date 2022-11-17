import * as http from 'http';
import * as stream from 'stream';
import { createHash } from 'crypto';
import { Subject } from 'rxjs';
import { Service } from '@server/common/service.decorator';

@Service
export default class WebsocketService {

  private HANDSHAKE_CONSTANT: string = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  private PING_INTERVAL: number = 5000;

  private OPCODE = {
    PING: 0x89,
    SHORT_TEXT_MESSAGE: 0x81,
  };

  private DATA_LENGTH = {
    MIDDLE: 128,
    SHORT: 125,
    LONG: 126,
    VERY_LONG: 127,
  };

  private CONTROL_MESSAGES = {
    PING: Buffer.from([this.OPCODE.PING, 0x0]),
  };

  public readonly connections: Set<stream.Duplex> = new Set();

  public readonly request$: Subject<[stream.Duplex, Buffer, Subject<true>]> = new Subject();
  public readonly response$: Subject<[stream.Duplex, Buffer]> = new Subject();
  public readonly terminatedConnection$: Subject<stream.Duplex> = new Subject();

  private server: http.Server = http.createServer().listen(this.port);

  constructor(private port: number) {
    this.server.on('upgrade', (request: http.IncomingMessage, socket: stream.Duplex) => {
      this.connections.add(socket);
      this.writeResponseHeaders(request, socket);
      const terminated$ = this.pingOrTerminate(socket);

      socket.on('data', (data: Buffer) => {
        if (data[0] === this.OPCODE.SHORT_TEXT_MESSAGE) {
          this.splitMessage(data).forEach((request) => {
            this.request$.next([socket, request, terminated$]);
          });
        }
      });
    });

    this.response$.subscribe(([socket, responseBuffer]) => (
      this.sendMessage(responseBuffer, socket)
    ));

    console.log('Server start on port:', this.port);
  }

  public sendMessage(message: Buffer, socket: stream.Duplex): void {
    const length = message.length;
    let meta: Buffer;

    if (length <= this.DATA_LENGTH.SHORT) {
      meta = Buffer.alloc(2);
      meta[1] = length;
    } else if (length <= 0xffff) {
      meta = Buffer.alloc(4);
      meta[1] = this.DATA_LENGTH.LONG;
      meta[2] = (length >> 8) & 0xff;
      meta[3] = length & 0xff;
    } else {
      meta = Buffer.alloc(10);
      meta[1] = this.DATA_LENGTH.VERY_LONG;
      meta[2] = (length >> 56) & 0xff;
      meta[3] = (length >> 48) & 0xff;
      meta[4] = (length >> 40) & 0xff;
      meta[5] = (length >> 32) & 0xff;
      meta[6] = (length >> 24) & 0xff;
      meta[7] = (length >> 16) & 0xff;
      meta[8] = (length >> 8) & 0xff;
      meta[9] = length & 0xff;
    }

    meta[0] = this.OPCODE.SHORT_TEXT_MESSAGE;
    socket.write(Buffer.concat([meta, message]));
  }

  private writeResponseHeaders(request: http.IncomingMessage, socket: stream.Duplex): void {
    const clientKey = request.headers['sec-websocket-key'];
    const handshakeKey = createHash('sha1')
      .update(clientKey + this.HANDSHAKE_CONSTANT)
      .digest('base64');
    const responseHeaders = [
      'HTTP/1.1 101',
      'upgrade: websocket',
      'connection: upgrade',
      `sec-websocket-accept: ${handshakeKey}`,
      '\r\n',
    ];

    socket.write(responseHeaders.join('\r\n'));
  }

  private pingOrTerminate(socket: stream.Duplex): Subject<true> {
    const id = setInterval(() => socket.write(this.CONTROL_MESSAGES.PING), this.PING_INTERVAL);
    const events = ['end', 'close', 'error'] as const;
    const terminated$: Subject<true> = new Subject();

    events.forEach((event) => {
      socket.once(event, () => {
        clearInterval(id);
        this.connections.delete(socket);

        this.terminatedConnection$.next(socket);
        terminated$.next(true);
        terminated$.complete();
      });
    });

    return terminated$;
  }

  private decryptMessage(message: Buffer) {
    const length = message[1] ^ this.DATA_LENGTH.MIDDLE;

    if (length <= this.DATA_LENGTH.SHORT) {
      const lastIndex = length + 6;

      return {
        length,
        mask: message.subarray(2, 6),
        data: message.subarray(6, lastIndex),
        nextMessage: message.subarray(lastIndex),
      };
    }

    if (length === this.DATA_LENGTH.LONG) {
      const partLength = message.subarray(2, 4).readInt16BE();
      const lastIndex = partLength + 8;

      return {
        length: partLength,
        mask: message.subarray(4, 8),
        data: message.subarray(8, lastIndex),
        nextMessage: message.subarray(lastIndex),
      };
    }

    if (length === this.DATA_LENGTH.VERY_LONG) {
      const partLength = message.subarray(2, 10).readBigInt64BE();
      const lastIndex = Number(partLength) + 14;

      return {
        length: partLength,
        mask: message.subarray(10, 14),
        data: message.subarray(14, lastIndex),
        nextMessage: message.subarray(lastIndex),
      };
    }

    throw new Error('Wrong message format');
  }

  private unmasked(mask: Buffer, data: Buffer) {
    const maskLength = 4;
    return Buffer.from(data.map((byte, i) => byte ^ mask[i % maskLength]));
  }

  private splitMessage(message: Buffer, requests: Buffer[] = []): Buffer[] {
    const meta = this.decryptMessage(message);
    const request = this.unmasked(meta.mask, meta.data);
    requests.push(request);

    if (meta.nextMessage.length) {
      this.splitMessage(meta.nextMessage, requests);
    }

    return requests;
  }

}

