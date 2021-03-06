import { injectable } from 'inversify';
import { Server } from 'socket.io';
import { Lobby } from './lobby';

@injectable()
export class LobbySolo extends Lobby {

  private readonly SOLO_TEAM_SIZE: number = 2;
  constructor(io: Server) {
    super(io);
    this.size = this.SOLO_TEAM_SIZE;
  }
}