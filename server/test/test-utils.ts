import { Container } from 'inversify';
import sinon from 'sinon';
import { containerBootstrapper } from '../app/inversify.config';

let sandbox: sinon.SinonSandbox | undefined;
let container: Container | undefined;

export const testingContainer: () => Promise<[Container, sinon.SinonSandbox]> = async () => {
  sandbox = sinon.createSandbox();
  container = await containerBootstrapper();

  // Insert all container rebinds necessary to all test contexts here.

  return [container, sandbox];
};

afterEach(() => {
  if (sandbox) {
    sandbox.reset();
    sandbox.restore();
    sandbox = undefined;
  }

  if (container) {
    container.unbindAll();
    container = undefined;
  }
});

export type Stubbed<T> = T &
  {
    [keys in keyof T]: sinon.SinonStub;
  };
