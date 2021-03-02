
//import { Server, Socket } from 'socket.io';
//import { SocketIo } from './socketio';
import { expect } from 'chai';
import { describe, beforeEach } from 'mocha';
import { testingContainer } from './../test/test-utils';
import Types from './types';
import { SocketIdService } from './services/socket-id.service';
import { DatabaseService } from './services/database.service';


describe('SocketIo', () => {
  let socketIdService: SocketIdService;
  let databaseService: DatabaseService;

  //let server: SocketIO.Server;
  //let socket: SocketIo;
  //let client: SocketIOClient.Socket;

  beforeEach(async () => {
    await testingContainer().then((instance) => {
      socketIdService = instance[0].get<SocketIdService>(Types.SocketIdService);
      databaseService = instance[0].get<DatabaseService>(Types.DatabaseService);
    });
  });

  it('should instanciate correctly', (done: Mocha.Done) => {
    expect(socketIdService).to.be.instanceOf(SocketIdService);
    expect(databaseService).to.be.instanceOf(DatabaseService);
    done();
  });

    /*it("should connect socket", (done: Function) => {
        client.on("connect", () => {
            assert.equal(client.connected, true);
            client.disconnect();
            done();
        });
    });*/
});