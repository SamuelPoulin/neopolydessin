import { expect } from 'chai';
import { describe, beforeEach } from 'mocha';
import { testingContainer } from '../../test/test-utils';
import Types from '../types';

import { SocketIdService } from './socket-id.service';


describe('SocketId Service', () => {
  let socketIdService: SocketIdService;

  const accountId1 = 'accountId1';
  const accountId2 = 'accountId2';
  const accountId3 = 'accountId3';

  const socketId1 = 'socketId1';
  const socketId2 = 'socketId2';
  const socketId3 = 'socketId3';

  beforeEach(async () => {
    await testingContainer().then((instance) => {
        socketIdService = instance[0].get<SocketIdService>(Types.SocketIdService);
    });
    socketIdService.accountIdsocketIdMap = new Map<string, string>();
  });

  it('should instanciate correctly', (done: Mocha.Done) => {
    expect(socketIdService).to.be.instanceOf(SocketIdService);
    done();
  });

  it('should add user to map correctly', (done: Mocha.Done) => {
    socketIdService.AssociateAccountIdToSocketId(accountId1, socketId1);
    expect(socketIdService.accountIdsocketIdMap.get(accountId1)).to.equal(socketId1);
    socketIdService.accountIdsocketIdMap.delete(accountId1);
    done();
  });

  it('should remove user of map correctly with given socketId', (done: Mocha.Done) => {
    socketIdService.accountIdsocketIdMap.set(accountId2, socketId2)
    expect(socketIdService.accountIdsocketIdMap.get(accountId2)).to.equal(socketId2);

    socketIdService.DisconnectAccountIdSocketId(socketId2);
    expect(socketIdService.accountIdsocketIdMap.get(accountId2)).to.equal(undefined);

    done();
  });

  it('should not remove user with wrong socketId', (done: Mocha.Done) => {
    socketIdService.accountIdsocketIdMap.set(accountId2, socketId2)
    expect(socketIdService.accountIdsocketIdMap.get(accountId2)).to.equal(socketId2);

    socketIdService.DisconnectAccountIdSocketId(socketId3);
    expect(socketIdService.accountIdsocketIdMap.get(accountId2)).to.equal(socketId2);
    expect(socketIdService.accountIdsocketIdMap.get(accountId3)).to.equal(undefined);

    done();
  });

  it('should get socketId from map correctly with given accountId', (done: Mocha.Done) => {
    socketIdService.accountIdsocketIdMap.set(accountId2, socketId2)
    expect(socketIdService.accountIdsocketIdMap.get(accountId2)).to.equal(socketId2);

    expect(socketIdService.GetSocketIdOfAccountId(accountId2)).to.equal(socketId2);
    socketIdService.accountIdsocketIdMap.delete(accountId2);
    done();
  });

  it('should get accountId from map correctly with given socketId', (done: Mocha.Done) => {
    socketIdService.accountIdsocketIdMap.set(accountId2, socketId2)
    socketIdService.accountIdsocketIdMap.set(accountId3, socketId3)
    expect(socketIdService.accountIdsocketIdMap.get(accountId3)).to.equal(socketId3);

    expect(socketIdService.GetAccountIdOfSocketId(socketId3)).to.equal(accountId3);
    socketIdService.accountIdsocketIdMap.delete(accountId3);
    done();
  });

  it('should return undefined if entry doesnt exist', (done: Mocha.Done) => {
    expect(socketIdService.GetAccountIdOfSocketId(socketId3)).to.equal(undefined);
    done();
  });
});