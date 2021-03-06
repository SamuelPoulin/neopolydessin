import { DrawingCommands } from "../app/services/drawing-commands.service";
import { testingContainer } from "../test/test-utils";
import Types from '../app/types';
import { LobbyClassique } from "./lobby-classique";
import { Server } from "socket.io";
import { expect } from "chai";

describe('LobbyClassique', () => {

    let lobbyClassique: LobbyClassique;
    let drawingCommands: DrawingCommands;
    let io: Server;
    before(() => {
    });

    after(() => {
    });

    beforeEach(async () => {
        await testingContainer().then((instance) => {
            drawingCommands = instance[0].get<DrawingCommands>(Types.DrawingCommands);
        });
        io = new Server();
        lobbyClassique = new LobbyClassique(io);
    });

    it('should instantiate correctly', (done: Mocha.Done) => {
        expect(lobbyClassique).to.be.instanceOf(LobbyClassique);
        done();
    });
})