/* tslint:disable:no-any no-magic-numbers */
import { expect } from 'chai';
import * as sinon from 'sinon';

import { Server } from './server';

import { testingContainer } from '../test/test-utils';
import Types from './types';

import { DEV_PORT, PROD_PORT } from './constants';

describe('Server', () => {
  let server: Server;
  let anotherServer: Server;

  beforeEach(async () => {
    await testingContainer().then((instance) => {
      server = instance[0].get<Server>(Types.Server);
      anotherServer = instance[0].get<Server>(Types.Server);
    });
  });

  it('should init correctly on the development port', (done: Mocha.Done) => {
    const spy = sinon.spy(server, 'onListening' as any);

    server.init(DEV_PORT);

    setTimeout(() => {
      expect(spy.called).to.equal(true);

      spy.restore();
      done();
    });
  });

  it('should exit the process when init with port 80 is called without higher privileges', (done: Mocha.Done) => {
    const stub = sinon.stub(process, 'exit');

    server.init(PROD_PORT);

    setTimeout(() => {
      process.env.USER === 'root' ? expect(stub.called).to.equal(false) : expect(stub.called).to.equal(true);

      stub.restore();
      done();
    });
  });

  it('should throw an error if two servers try to init on the same port', (done: Mocha.Done) => {
    const spy = sinon.spy(anotherServer, 'onError' as any);
    const stub = sinon.stub(process, 'exit');

    server.init(DEV_PORT);
    anotherServer.init(DEV_PORT);

    setTimeout(() => {
      expect(spy.called).to.equal(true);
      expect(stub.called).to.equal(true);

      spy.restore();
      stub.restore();
      done();
    });
  });

  it('should return the correct port', (done: Mocha.Done) => {
    process.env.NODE_ENV === 'test' ? expect(Server.port).to.equal(3000) : expect(Server.port).to.equal(80);
    done();
  });

  afterEach(() => {
    if (server && server.isListening) {
      server.close();
    }
    if (anotherServer && anotherServer.isListening) {
      anotherServer.close();
    }
  });
});
