import { Injectable } from '@nestjs/common';
import { ConnectedClients } from './interfaces/connected-clients.interfaces';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MessagesWsService {

  private connectedClients: ConnectedClients = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async registerClient( client: Socket, userId: string ){

    const user = await this.userRepository.findOneBy({ id: userId });

    if ( !user ) throw new Error('User not found');
    if ( !user.isActive ) throw new Error('User is not active');

    this.checkUsersConnected( user );

    this.connectedClients[client.id] = {
      socket: client,
      user
    };
  }

  removeClient( clientId: string ){
    delete this.connectedClients[clientId]
  }

  getCountConnectedClients(): number {
    return Object.keys( this.connectedClients ).length;
  }

  getConnectedClients(): string[] {
    return Object.keys( this.connectedClients );
  }

  getUserFullNameBySocketId( socketId: string ): string {
    return this.connectedClients[socketId].user.fullName
  }

  private checkUsersConnected( user: User ) {
    for (const clientId of Object.keys( this.connectedClients ) ) {
      const connectedClient = this.connectedClients[clientId]
      if ( connectedClient.user.id === user.id ) {
        connectedClient.socket.disconnect()
        break;
      }
    }
  }

}
