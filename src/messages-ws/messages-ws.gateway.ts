import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection( client: Socket ) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient( client, payload.id );
    } catch (error) {
      client.disconnect();
      return
    }
    // this.messagesWsService.registerClient( client, payload.id );
    // console.log({ conectados: this.messagesWsService.getCountConnectedClients() });
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients() )
  }

  handleDisconnect( client: Socket ) {
    this.messagesWsService.removeClient( client.id );
    // console.log({ conectados: this.messagesWsService.getCountConnectedClients() });
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients() )

  }

  @SubscribeMessage('message-from-client')
  handleMessageFromCLient( client: Socket, payload: NewMessageDto){

    //! emitir al cliente conectado 
    // client.emit('message-from-server', {
    //   fullName: 'Danilo',
    //   message: payload.message || 'no-message'
    // })

    //! emitir a todos menos al cliente conectado
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Danilo',
    //   message: payload.message || 'no-message'
    // })

    //! emitir a todos
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullNameBySocketId( client.id ),
      message: payload.message || 'no-message'
    })
  }

}
