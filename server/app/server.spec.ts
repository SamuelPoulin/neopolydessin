/* tslint:disable:no-any no-magic-numbers */
import { expect } from 'chai';
import sinon from 'sinon';

import { Server } from './server';

import { testingContainer } from '../test/test-utils';
import Types from './types';

import { DEV_PORT, PROD_PORT, TEST_PORT } from './constants';

describe('Server', () => {
  let server: Server;
  let anotherServer: Server;

  beforeEach(async () => {
    await testingContainer().then((instance) => {
      server = instance[0].get<Server>(Types.Server);
      anotherServer = instance[0].get<Server>(Types.Server);
    });
  });

  it('should init correctly on the test port', (done: Mocha.Done) => {
    const spy = sinon.spy(server, 'onListening' as any);

    server.init(TEST_PORT);

    setTimeout(() => {
      expect(spy.called).to.equal(true);

      spy.restore();
      done();
    });
  });

  it('should throw an error if two servers try to init on the same port', (done: Mocha.Done) => {
    const spy = sinon.spy(anotherServer, 'onError' as any);
    const stub = sinon.stub(process, 'exit');

    server.init(TEST_PORT);
    anotherServer.init(TEST_PORT);

    setTimeout(() => {
      expect(spy.called).to.equal(true);
      expect(stub.called).to.equal(true);

      spy.restore();
      stub.restore();
      done();
    });
  });

  it('should return the correct port', (done: Mocha.Done) => {
    process.env.NODE_ENV === 'test' ? expect(Server.port).to.equal(DEV_PORT) : expect(Server.port).to.equal(PROD_PORT);
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
