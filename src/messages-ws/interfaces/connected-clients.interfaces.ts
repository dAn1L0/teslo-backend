import { Socket } from "socket.io";
import { User } from "../../auth/entities/auth.entity";


export interface ConnectedClients {
  [id: string]: {
    socket: Socket,
    user: User
  }
}